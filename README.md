## Эскроу

####Для полноценной работы с приложение понадобится:

1) Задеплоить контракт в environment 'Injected Web3' с указанием двух адресов: адрес покупателя и адрес продавца.

2) Скопировать адрес задеплоенного контракта в src/constants/app.js в переменную CONTRACT_ADDRESS.

3) Запустить приложение через команду в командной строке: **npm start**

####Во время работы:

1) Текущий вдрес, подтягиваемый из metamask, может либо принять, либо отказаться от всей процедуры.

2) Покупатель должен пополнить баланс контракта на договоренную с продавцом сумму.

3) При отказе хотя бы одного из участников, все средства возвращаются покупателю.

4) При подтверждении обоих участников все средства переходят продавцу.

5) При прошествии 30 дней с момента создания контракта покупатель может вернуть себе все средства,
подтвердив сделку, при условии что это не сделал продавец.

