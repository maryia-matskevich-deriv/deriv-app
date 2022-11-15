import React from 'react';
import RootStore from 'Stores/index';
import AppStore from 'Stores/app-store';
import { connect } from 'Stores/connect';
import ReactJoyride from 'react-joyride';
import classNames from 'classnames';
import LoadModal from 'Components/load-modal';
import WorkspaceWrapper from './workspace-wrapper';
import { BOT_BUILDER_TOUR, handleJoyrideCallback } from '../joyride-config';

type TBotBuilder = {
    app: AppStore;
    active_tab: number;
    has_onboard_tour_started: boolean;
    is_preview_on_popup: boolean;
    setOnBoardTourRunState: (has_onboard_tour_started: boolean) => boolean;
    has_bot_builder_tour_started: boolean;
};

const BotBuilder = ({
    app,
    active_tab,
    has_onboard_tour_started,
    is_preview_on_popup,
    has_bot_builder_tour_started,
}: TBotBuilder) => {
    const [is_tour_running, setTourRun] = React.useState<boolean>(true);
    const { onMount, onUnmount } = app;

    React.useEffect(() => {
        onMount();
        return () => onUnmount();
    }, []);

    return (
        <div
            className={classNames('bot-builder', {
                'bot-builder--active': active_tab === 1 && !is_preview_on_popup,
                'bot-builder--inactive': is_preview_on_popup,
            })}
        >
            {is_preview_on_popup ? null : (
                <div
                    id='scratch_div'
                    style={{
                        width: 'calc(100vw - 3.2rem)',
                        height: 'var(--bot-content-height)',
                    }}
                >
                    <WorkspaceWrapper />
                    {has_bot_builder_tour_started && active_tab === 1 && !has_onboard_tour_started && (
                        <ReactJoyride
                            steps={BOT_BUILDER_TOUR}
                            run={is_tour_running}
                            continuous
                            showProgress
                            callback={handleJoyrideCallback}
                            locale={{ back: 'Previous' }}
                            styles={{
                                options: {
                                    arrowColor: 'var(--general-section-7)',
                                    backgroundColor: 'var(--general-section-7)',
                                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                                    primaryColor: 'var(--brand-red-coral)',
                                    textColor: 'var(--text-joyride-tour)',
                                    spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
                                },
                                buttonBack: {
                                    border: '0.1rem solid var(--text-less-prominent)',
                                    marginRight: '1rem',
                                    borderRadius: '0.4rem',
                                    color: 'var(--text-joyride-tour)',
                                    padding: '0.6rem',
                                },
                            }}
                        />
                    )}
                </div>
            )}
            {/* removed this outside from toolbar becuase it needs to loaded seperately without dependency */}
            <LoadModal />
        </div>
    );
};

export default connect(({ app, dashboard }: RootStore) => ({
    app,
    active_tab: dashboard.active_tab,
    has_onboard_tour_started: dashboard.has_onboard_tour_started,
    setOnBoardTourRunState: dashboard.setOnBoardTourRunState,
    is_preview_on_popup: dashboard.is_preview_on_popup,
    has_bot_builder_tour_started: dashboard.has_bot_builder_tour_started,
}))(BotBuilder);
