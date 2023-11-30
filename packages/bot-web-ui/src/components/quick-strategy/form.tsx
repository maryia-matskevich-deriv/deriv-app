/* eslint-disable simple-import-sort/imports */
import React from 'react';
import { useDBotStore } from 'Stores/useDBotStore';
import { observer, useStore } from '@deriv/stores';
import './quick-strategy.scss';
import SymbolSelect from './selects/symbol';
import TradeTypeSelect from './selects/trade-type';
import ContractTypeSelect from './selects/contract-type';
import DurationTypeSelect from './selects/duration-type';
import QSInput from './inputs/qs-input';
import QSCheckbox from './inputs/qs-checkbox';
import QSInputLabel from './inputs/qs-input-label';
import { STRATEGIES } from './config';
import { TConfigItem, TFormData } from './types';
import { useFormikContext } from 'formik';

const QuickStrategyForm = observer(() => {
    const { ui } = useStore();
    const { quick_strategy } = useDBotStore();
    const { selected_strategy, setValue } = quick_strategy;
    const config: TConfigItem[][] = STRATEGIES[selected_strategy]?.fields;
    const { is_mobile } = ui;
    const { values, setFieldTouched, setFieldValue } = useFormikContext<TFormData>();

    React.useEffect(() => {
        window.addEventListener('keydown', handleEnter);
        return () => {
            window.removeEventListener('keydown', handleEnter);
        };
    }, []);

    const onChange = async (key: string, value: string | number | boolean) => {
        setValue(key, value);
        await setFieldTouched(key, true, true);
        await setFieldValue(key, value);
    };

    const handleEnter = (event: KeyboardEvent) => {
        if (event?.key && event.key == 'Enter') {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const renderForm = () => {
        return config.map((group, group_index) => {
            if (!group?.length) return null;
            return (
                <div className='qs__body__content__form__group' key={group_index}>
                    {group.map((field, field_index) => {
                        const key = `${field.name || field.type} + ${field_index}`;

                        if (
                            (is_mobile && field.hide?.includes('mobile')) ||
                            (!is_mobile && field.hide?.includes('desktop'))
                        ) {
                            return null;
                        }

                        const excluded_fields: Array<string> = ['last_digit_prediction', 'label_last_digit_prediction'];
                        const excluded_trade_types: Array<string> = ['matchesdiffers', 'overunder'];

                        if (
                            excluded_fields.includes(field.name as string) &&
                            values.type !== 'DIGITMATCH' &&
                            !excluded_trade_types.includes(values.tradetype as string)
                        ) {
                            return null;
                        }

                        switch (field.type) {
                            // Generic or common fields
                            case 'number': {
                                if (!field.name) return null;
                                const { should_have = [] } = field;
                                if (should_have?.length) {
                                    const should_enable = should_have.every((item: TFormData) => {
                                        return values[item.key as keyof TFormData] === item.value;
                                    });
                                    if (!should_enable && is_mobile) {
                                        return null;
                                    }
                                    return (
                                        <QSInput
                                            {...field}
                                            key={key}
                                            name={field.name as string}
                                            disabled={!should_enable}
                                            onChange={onChange}
                                        />
                                    );
                                }
                                return <QSInput {...field} onChange={onChange} key={key} name={field.name as string} />;
                            }
                            case 'text': {
                                if (!field.name) return null;
                                return (
                                    <QSInput
                                        {...field}
                                        onChange={onChange}
                                        regex={field.regex}
                                        key={key}
                                        name={field.name as string}
                                    />
                                );
                            }
                            case 'label':
                                if (!field.label) return null;
                                return (
                                    <QSInputLabel key={key} label={field.label} description={field.description || ''} />
                                );
                            case 'checkbox':
                                return (
                                    <QSCheckbox
                                        {...field}
                                        key={key}
                                        name={field.name as string}
                                        label={field.label as string}
                                    />
                                );
                            // Dedicated components only for Quick-Strategy
                            case 'symbol':
                                return <SymbolSelect {...field} key={key} />;
                            case 'tradetype':
                                return <TradeTypeSelect {...field} key={key} />;
                            case 'durationtype':
                                return <DurationTypeSelect {...field} key={key} />;
                            case 'contract_type':
                                return <ContractTypeSelect {...field} key={key} name={field.name as string} />;
                            default:
                                return null;
                        }
                    })}
                </div>
            );
        });
    };

    return <div>{renderForm()}</div>;
});

export default QuickStrategyForm;
