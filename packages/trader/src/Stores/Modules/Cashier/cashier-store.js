import {
    action,
    observable }    from 'mobx';
import { WS }       from 'Services';
import BaseStore    from '../../base-store';

export default class CashierStore extends BaseStore {
    @observable is_loading       = false;
    @observable container_height = 0;
    @observable error_message    = '';

    @observable container_urls = {
        deposit : '',
        withdraw: '',
    };

    @observable is_session_timeout = {
        deposit : false,
        withdraw: false,
    };

    @observable is_verification_button_clicked = false;
    @observable is_verification_email_sent     = false;

    containers = {
        deposit : 'deposit',
        withdraw: 'withdraw',
    };

    timeout_verification_button;

    @action.bound
    async onMount(container, verification_code) {
        if (!['deposit', 'withdraw'].includes(container)) {
            throw new Error('Cahshier Store onMount requires deposit or cashier as a container name');
        }
        this.setErrorMessage('');
        this.setContainerHeight(0);
        this.setLoading(true);

        if (this.container_urls[container] && !this.is_session_timeout[container]) {
            this.checkIframeLoaded();
            return;
        }

        this.setSessionTimeout(false, this.containers[container]);
        this.setContainerUrl('', this.containers[container]);

        const response_cashier = await WS.cashier(this.containers[container], verification_code);

        // TODO: uncomment this if cross origin access is allowed
        // const xhttp = new XMLHttpRequest();
        // const that = this;
        // xhttp.onreadystatechange = function() {
        //     if (this.readyState !== 4 || this.status !== 200) {
        //         return;
        //     }
        //     that.setContainerUrl(this.responseText, this.containers[container]);
        // };
        // xhttp.open('GET', response_cashier.cashier, true);
        // xhttp.send();

        // TODO: error handling
        if (response_cashier.error) {
            this.setLoading(false);
            this.setErrorMessage(response_cashier.error.message);
            if (verification_code) {
                // clear verification code on error
                this.clearVerification();
            }
        } else {
            await this.checkIframeLoaded();
            this.setContainerUrl(response_cashier.cashier, this.containers[container]);

            // cashier session runs out after one minute
            // so we should resend the request for container (deposit|withdraw) url on next mount
            setTimeout(() => {
                this.setSessionTimeout(true, this.containers[container]);
            }, 60000);
        }
    }

    @action.bound
    async onMountDeposit() {
        await this.onMount('deposit');
    }

    @action.bound
    async checkIframeLoaded() {
        window.removeEventListener('message', this.onIframeLoaded);
        window.addEventListener('message', this.onIframeLoaded, false);
    }

    @action.bound
    onIframeLoaded() {
        this.setLoading(false);
        // set the height of the container after content loads so that the
        // loading bar stays vertically centered until the end
        this.setContainerHeight('100%');
    }

    @action.bound
    setContainerUrl(url, container) {
        this.container_urls[container] = url;
    }

    @action.bound
    setContainerHeight(height) {
        this.container_height = height;
    }

    @action.bound
    setErrorMessage(message) {
        this.error_message = message;
    }

    @action.bound
    setLoading(is_loading) {
        this.is_loading = is_loading;
    }

    @action.bound
    setSessionTimeout(is_session_time_out, container) {
        this.is_session_timeout[container] = is_session_time_out;
    }

    @action.bound
    setVerificationButtonClicked(is_verification_button_clicked) {
        this.is_verification_button_clicked = is_verification_button_clicked;
    }

    @action.bound
    setVerificationEmailSent(is_verification_email_sent) {
        this.is_verification_email_sent = is_verification_email_sent;
    }

    // verification token expires after one hour
    // so we should show the verification request button again after that
    @action.bound
    setTimeoutVerification() {
        if (this.timeout_verification_button) {
            clearTimeout(this.timeout_verification_button);
        }
        this.timeout_verification_button = setTimeout(() => {
            this.clearVerification();
        }, 3600000);
    }

    @action.bound
    async onMountWithdraw(verification_code) {
        await this.onMount('withdraw', verification_code);
    }

    @action.bound
    async sendVerificationEmail(email) {
        if (this.is_verification_button_clicked) {
            return;
        }

        this.setVerificationButtonClicked(true);
        const response_verify_email = await WS.verifyEmail(email, 'payment_withdraw');

        if (response_verify_email.error) {
            this.setVerificationButtonClicked(false);
            this.error_message = response_verify_email.error.message;
        } else {
            this.setVerificationEmailSent(true);
            this.setTimeoutVerification();
        }
    }

    @action.bound
    clearVerification() {
        this.setVerificationButtonClicked(false);
        this.setVerificationEmailSent(false);
        this.root_store.client.setVerificationCode('');
    }

    @action.bound
    onUnmount() {
        this.clearVerification();
    }
}
