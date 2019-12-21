import React, { Component } from 'react';
import Web3 from 'web3';
import Modal from 'react-modal';
import Amount from 'arui-feather/amount';
import Button from 'arui-feather/button';
import OkIcon from 'arui-feather/icon/ui/ok';
import FailIcon from 'arui-feather/icon/ui/fail';
import IconButton from 'arui-feather/icon-button';

import { CONTRACT_ADDRESS, CONTRACT_ABI, BALANCE_MINORITY } from '../constants/app';
import './App.css';

const web3 = new Web3(Web3.givenProvider);

const STATUSES = {
    ACCEPT: 'accept',
    REJECT: 'reject'
};

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};

class App extends Component {
    state = {
        contract: new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS),
        owner: undefined,
        seller: undefined,
        sellerStatus: undefined,
        buyer: undefined,
        buyerStatus: undefined,
        balance: 0,
        isBalanceLoading: false,
        isBalanceModalShow: false
    };

    async componentDidMount() {
        const { contract } = this.state;

        window.ethereum.enable();

        const owner = await contract.methods.owner().call();
        const seller = await contract.methods.seller().call();
        const buyer = await contract.methods.buyer().call();
        const balance = await contract.methods.balance().call();

        this.setState({ owner, seller, buyer, balance });
    }

    handleDeposit = async () => {
        const { contract, buyer } = this.state;

        this.setState({ isBalanceLoading: true });

        await contract.methods.deposit().send({
            from: buyer,
            value: web3.utils.toWei('0.1', 'ether')
        });
        const balance = await contract.methods.balance().call();

        this.setState({ isBalanceLoading: false, balance });
    };

    handleAccept = (address) => {
        const { contract } = this.state;

    };

    handleReject = (address) => {

    };

    openBalanceModal = () => {
        this.setState({ isBalanceModalShow: true });
    };

    closeBalanceModal = () => {
        this.setState({ isBalanceModalShow: false });
    };

    render() {
        const { owner, seller, buyer, balance, isBalanceLoading, isBalanceModalShow } = this.state;

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
                                <tr>
                                    <td className='app__info__table__key'>Покупатель:</td>
                                    <td className='app__info__table__value'>{ buyer }</td>
                                    <td className='app__info__table__actions'>
                                        {
                                            buyer && (
                                                <div>
                                                    <IconButton onClick={ this.handleAccept(buyer)}>
                                                        <OkIcon colored={ true } size='l'/>
                                                    </IconButton>
                                                    <IconButton onClick={ this.handleReject(buyer)}>
                                                        <FailIcon size='l'/>
                                                    </IconButton>
                                                </div>
                                            )
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td className='app__info__table__key'>Продавец:</td>
                                    <td className='app__info__table__value'>{ seller }</td>
                                    <td className='app__info__table__actions'>
                                        {
                                            seller && (
                                                <div>
                                                    <IconButton><OkIcon colored={ true } size='l'/></IconButton>
                                                    <IconButton><FailIcon size='l'/></IconButton>
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
                                { isBalanceLoading ? 'Идет оплата...' : 'Внести деньги' }
                            </Button>
                        </div>
                    </div>
                </div>
                <Modal
                    isOpen={ isBalanceModalShow }
                    style={customStyles}
                    onRequestClose={ this.closeBalanceModal }
                >
                    <Button
                        size='m'
                        view='extra'
                        width='available'
                        disabled={ isBalanceLoading }
                        onClick={ this.handleDeposit }
                    >
                        { isBalanceLoading ? 'Идет оплата...' : 'Внести деньги' }
                    </Button>
                </Modal>
            </div>
        );
    }
}

export default App;
