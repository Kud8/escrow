import React, { Component } from 'react';
import Web3 from 'web3';
import Modal from 'react-modal';
import Amount from 'arui-feather/amount';
import Button from 'arui-feather/button';
import OkIcon from 'arui-feather/icon/ui/ok';
import FailIcon from 'arui-feather/icon/ui/fail';
import IconButton from 'arui-feather/icon-button';
import Input from 'arui-feather/input';
import cn from 'classname';

import { CONTRACT_ADDRESS, CONTRACT_ABI, BALANCE_MINORITY } from '../constants/app';
import './App.css';

const web3 = new Web3(Web3.givenProvider);

const STATUSES = {
    ACCEPT: 'accept',
    REJECT: 'reject'
};

const customStyles = {
    content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '40px'
    },
    overlay: {
        background: 'rgba(0,0,0,0.85)'
    }
};

class App extends Component {
    state = {
        contract: new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS),
        currentAccount: undefined,
        owner: undefined,
        seller: undefined,
        sellerStatus: undefined,
        buyer: undefined,
        buyerStatus: undefined,
        balance: 0,
        isBalanceLoading: false,
        isBalanceModalShow: false,
        inputMoney: 0,
        error: undefined
    };

    async componentDidMount() {
        const { contract } = this.state;

        window.ethereum.enable();

        try {
            const owner = (await contract.methods.owner().call()).toLowerCase();
            const seller = (await contract.methods.seller().call()).toLowerCase();
            const buyer = (await contract.methods.buyer().call()).toLowerCase();
            const buyerStatus = (await contract.methods.buyerOk().call()) ? STATUSES.ACCEPT : undefined;
            const sellerStatus = (await contract.methods.sellerOk().call()) ? STATUSES.ACCEPT : undefined;
            const balance = await contract.methods.balance().call();
            const currentAccount = web3.eth.accounts.currentProvider.selectedAddress.toLowerCase();

            setInterval(() => {
                const { currentAccount } = this.state;
                const newAccount = web3.eth.accounts.currentProvider.selectedAddress.toLowerCase();
                if (newAccount !== currentAccount) {
                    this.setState({ currentAccount: newAccount });
                }
            }, 500);

            this.setState({ owner, seller, sellerStatus, buyer, buyerStatus, balance, currentAccount }, () => console.log(this.state));
        } catch (error) {
            this.setState({ error })
        }

    }

    handleDeposit = async () => {
        const { contract, currentAccount, inputMoney } = this.state;

        this.setState({ isBalanceLoading: true });

        await contract.methods.deposit().send({
            from: currentAccount,
            value: web3.utils.toWei(inputMoney, 'ether')
        });
        const balance = await contract.methods.balance().call();

        this.setState({ isBalanceLoading: false, isBalanceModalShow: false, balance });
    };

    handleChangeStatus = async (address, isAccepted) => {
        const { contract, seller, sellerStatus, buyer, buyerStatus, currentAccount } = this.state;

        if (currentAccount !== address) {
            return;
        }

        if (isAccepted) {
            await contract.methods.accept().send({ from: currentAccount });
            if (buyerStatus === STATUSES.ACCEPT && sellerStatus === STATUSES.ACCEPT){
                alert(`Все средства были переведены продавцу ${seller}`);
            }
        } else {
            await contract.methods.reject().call();
            alert(`Все средства были возращены покупателю ${buyer}`);
        }

        if (address === buyer) {
            this.setState({ buyerStatus: isAccepted ? STATUSES.ACCEPT : STATUSES.REJECT });
        } else if (address === seller) {
            this.setState({ sellerStatus: isAccepted ? STATUSES.ACCEPT : STATUSES.REJECT });
        }
    };

    handleAccept = (address) => () => this.handleChangeStatus(address, true);
    handleReject = (address) => () => this.handleChangeStatus(address, false);

    openBalanceModal = () => this.setState({ isBalanceModalShow: true });
    closeBalanceModal = () => this.setState({ isBalanceModalShow: false });

    handleChangeMoneyInput = (inputMoney) => this.setState({ inputMoney });

    render() {
        const {
            error, owner, seller, buyer, balance, isBalanceLoading, isBalanceModalShow,
            buyerStatus, sellerStatus, currentAccount
        } = this.state;

        if (error) {
            return (
                <div className='app app__error'>
                    <h1>
                        Ошибка. Контракт не действителен.<br/>
                        Создайте новый и обновите приложение.
                    </h1>
                    <img src='https://cdn.oubly.net/img/the_dev_dog.gif' />
                </div>
            )
        }

        const ethBalance = balance && window.web3.fromWei(balance, 'ether');

        return (
            <div className='app'>
                <div className='app__info'>
                    <div className='app__info__table'>
                        <table>
                            <tbody>
                                <tr>
                                    <td className='app__info__table__key'>Создатель контракта:</td>
                                    <td className='app__info__table__value'>{ owner }</td>
                                    <td className='app__info__table__actions'>
                                        <div />
                                    </td>
                                </tr>
                                <tr className={ cn({'app__info__table__line--disabled': currentAccount !== buyer}) } >
                                    <td className='app__info__table__key'>Покупатель:</td>
                                    <td className='app__info__table__value'>{ buyer }</td>
                                    <td className='app__info__table__actions'>
                                        {
                                            buyer && (
                                                <div>
                                                    <IconButton
                                                        disabled={ currentAccount !== buyer }
                                                        onClick={ this.handleAccept(buyer)}
                                                    >
                                                        <OkIcon
                                                            className={ buyerStatus === STATUSES.ACCEPT ? 'icon__approve--pressed' : '' }
                                                            size='l'
                                                        />
                                                    </IconButton>
                                                    <IconButton
                                                        disabled={ currentAccount !== buyer }
                                                        onClick={ this.handleReject(buyer)}
                                                    >
                                                        <FailIcon
                                                            className={ buyerStatus === STATUSES.REJECT ? 'icon__reject--pressed' : '' }
                                                            size='l'
                                                        />
                                                    </IconButton>
                                                </div>
                                            )
                                        }
                                    </td>
                                </tr>
                                <tr className={ cn({'app__info__table__line--disabled': currentAccount !== seller}) }>
                                    <td className='app__info__table__key'>Продавец:</td>
                                    <td className='app__info__table__value'>{ seller }</td>
                                    <td className='app__info__table__actions'>
                                        {
                                            seller && (
                                                <div>
                                                    <IconButton
                                                        disabled={ currentAccount !== seller }
                                                        onClick={ this.handleAccept(seller)}
                                                    >
                                                        <OkIcon
                                                            className={ sellerStatus === STATUSES.ACCEPT ? 'icon__approve--pressed' : '' }
                                                            size='l'
                                                        />
                                                    </IconButton>
                                                    <IconButton
                                                        disabled={ currentAccount !== seller }
                                                        onClick={ this.handleReject(seller)}
                                                    >
                                                        <FailIcon
                                                            className={ sellerStatus === STATUSES.REJECT ? 'icon__reject--pressed' : '' }
                                                            size='l'
                                                        />
                                                    </IconButton>
                                                </div>
                                            )
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className='app__info__balance'>
                        <div className='app__info__balance__amount'>
                            <div>Баланс: </div>
                            <Amount
                                size='xl'
                                bold={ true }
                                amount={{
                                    value: ethBalance * BALANCE_MINORITY || 0,
                                    currency: {
                                        code: 'ETH',
                                        minority: BALANCE_MINORITY
                                    }
                                }}
                            />
                        </div>
                        <div className='app__info__balance__button'>
                            <Button
                                size='m'
                                view='extra'
                                width='available'
                                disabled={ isBalanceLoading }
                                onClick={ this.openBalanceModal }
                            >
                                { isBalanceLoading ? 'Идет оплата...' : 'Пополнить' }
                            </Button>
                        </div>
                    </div>
                </div>
                <Modal
                    isOpen={ isBalanceModalShow }
                    style={ customStyles }
                    onRequestClose={ this.closeBalanceModal }
                >
                    <div>
                        <Input
                            className='app__modal__input'
                            clear={ true }
                            onChange={ this.handleChangeMoneyInput }
                            label='Введите сумму в ETH'
                        />
                        <Button
                            className='app__modal__button'
                            size='m'
                            view='extra'
                            width='available'
                            disabled={ isBalanceLoading }
                            onClick={ this.handleDeposit }
                        >
                            { isBalanceLoading ? 'Идет оплата...' : 'Внести деньги' }
                        </Button>
                    </div>

                </Modal>
            </div>
        );
    }
}

export default App;
