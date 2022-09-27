import { getFormattedText } from '@deriv/shared';
import { info } from '../utils/broadcast';
import DBotStore from '../../../scratch/dbot-store';

let balance_string = '';

export default Engine =>
    class Balance extends Engine {
        observeBalance() {
            this.api.onMessage().subscribe(({ data }) => {
                if (data.msg_type === 'balance') {
                    const {
                        balance: { balance: b, currency },
                    } = data;

                    balance_string = getFormattedText(b, currency);
                    info({ accountID: this.accountInfo?.loginid, balance: balance_string });
                }
            });
        }

        // eslint-disable-next-line class-methods-use-this
        getBalance(type) {
            const { client } = DBotStore.instance;
            const balance = (client && client.balance) || 0;

            balance_string = getFormattedText(balance, client.currency, false);
            return type === 'STR' ? balance_string : balance;
        }
    };
