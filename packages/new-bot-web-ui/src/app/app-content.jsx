import React from 'react';
import { Loading } from '@deriv/components';
// !TODO: define setColors()
// import { setColors } from '@deriv/bot-skeleton';
import { ApiHelpers, ServerTime, api_base } from 'Services';
import {
    Audio,
    BotFooterExtensions,
    BotNotificationMessages,
    Dashboard,
    NetworkToastPopup,
    RoutePromptDialog,
} from 'Components';
import { MobxContentProvider } from 'Stores/connect';
import { observer, useStore } from '@deriv/stores';
import { useDBotStore } from 'Stores/useDBotStore';
import GTM from 'Utils/gtm';
import BotBuilder from 'Components/dashboard/bot-builder';
import './app.scss';

const AppContent = observer(() => {
    const [is_loading, setIsLoading] = React.useState(true);
    const RootStore = useStore();
    const {
        common,
        client,
        ui: { is_dark_mode_on },
    } = RootStore;
    const DBotStores = useDBotStore();
    const { app } = DBotStores;
    const { showDigitalOptionsMaltainvestError } = app;

    // TODO: Remove this when connect is removed completely
    const combinedStore = { ...DBotStores, core: { ...RootStore } };

    React.useEffect(() => {
        // setColors(is_dark_mode_on);
    }, [is_dark_mode_on]);

    React.useEffect(() => {
        /**
         * Inject: External Script Hotjar - for DBot only
         */
        (function (h, o, t, j) {
            /* eslint-disable */
            h.hj =
                h.hj ||
                function () {
                    (h.hj.q = h.hj.q || []).push(arguments);
                };
            /* eslint-enable */
            h._hjSettings = { hjid: 3050531, hjsv: 6 };
            const a = o.getElementsByTagName('head')[0];
            const r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }, []);

    React.useEffect(() => {
        showDigitalOptionsMaltainvestError(client, common);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client.is_options_blocked, client.account_settings.country_code]);

    React.useEffect(() => {
        api_base.init();
        GTM.init(combinedStore);
        ServerTime.init(common);
        app.setDBotEngineStores(combinedStore);
        ApiHelpers.setInstance(app.api_helpers_store);
        const { active_symbols } = ApiHelpers.instance;
        setIsLoading(true);
        active_symbols.retrieveActiveSymbols(true).then(() => {
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const onDisconnectFromNetwork = () => {
            setIsLoading(false);
        };
        window.addEventListener('offline', onDisconnectFromNetwork);
        return () => {
            window.removeEventListener('offline', onDisconnectFromNetwork);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return is_loading ? (
        <Loading />
    ) : (
        // TODO: remove MobxContentProvider when all connect method is removed
        <MobxContentProvider store={combinedStore}>
            {/* <BlocklyLoading /> */} {/* !TODO: temporary commented*/}
            <div className='bot-dashboard bot'>
                <Audio />
                <BotFooterExtensions />
                <BotNotificationMessages />
                <Dashboard />
                <NetworkToastPopup />
                <BotBuilder />
                <RoutePromptDialog />
            </div>
        </MobxContentProvider>
    );
});

export default AppContent;
