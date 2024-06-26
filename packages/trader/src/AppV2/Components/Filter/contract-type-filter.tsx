import React from 'react';
import { ActionSheet, Checkbox, Chip } from '@deriv-com/quill-ui';
import { Localize } from '@deriv/translations';

type TContractTypeFilter = {
    contractTypeFilter: string[] | [];
    onApplyContractTypeFilter: (filterValues: string[]) => void;
};

const availableContracts = [
    { tradeType: <Localize i18n_default_text='Accumulators' />, id: 'Accumulators' },
    { tradeType: <Localize i18n_default_text='Vanillas' />, id: 'Vanillas' },
    { tradeType: <Localize i18n_default_text='Turbos' />, id: 'Turbos' },
    { tradeType: <Localize i18n_default_text='Multipliers' />, id: 'Multipliers' },
    { tradeType: <Localize i18n_default_text='Rise/Fall' />, id: 'Rise/Fall' },
    { tradeType: <Localize i18n_default_text='Higher/Lower' />, id: 'Higher/Lower' },
    { tradeType: <Localize i18n_default_text='Touch/No touch' />, id: 'Touch/No touch' },
    { tradeType: <Localize i18n_default_text='Matches/Differs' />, id: 'Matches/Differs' },
    { tradeType: <Localize i18n_default_text='Even/Odd' />, id: 'Even/Odd' },
    { tradeType: <Localize i18n_default_text='Over/Under' />, id: 'Over/Under' },
];

const ContractTypeFilter = ({ contractTypeFilter, onApplyContractTypeFilter }: TContractTypeFilter) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [changedOptions, setChangedOptions] = React.useState<string[]>(contractTypeFilter);

    const onActionSheetClose = () => {
        setIsDropdownOpen(false);
        setChangedOptions(contractTypeFilter);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLSpanElement>) => {
        const newSelectedOption = (e.target as EventTarget & HTMLInputElement).id;

        if (changedOptions.includes(newSelectedOption)) {
            setChangedOptions([...changedOptions.filter(item => item !== newSelectedOption)]);
        } else {
            setChangedOptions([...changedOptions, newSelectedOption]);
        }
    };

    const getChipLabel = () => {
        const arrayLength = contractTypeFilter.length;
        if (!arrayLength) return <Localize i18n_default_text='All trade types' />;
        if (arrayLength === 1) return availableContracts.find(type => type.id === contractTypeFilter[0])?.tradeType;
        return <Localize i18n_default_text='{{amount}} trade types' values={{ amount: arrayLength }} />;
    };

    return (
        <React.Fragment>
            <Chip.Standard
                className='filter__chip'
                dropdown
                isDropdownOpen={isDropdownOpen}
                label={getChipLabel()}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                selected={!!changedOptions.length}
                size='md'
            />
            <ActionSheet.Root isOpen={isDropdownOpen} onClose={onActionSheetClose} position='left'>
                <ActionSheet.Portal shouldCloseOnDrag>
                    <ActionSheet.Header title={<Localize i18n_default_text='Filter by trade types' />} />
                    <ActionSheet.Content className='filter__item__wrapper'>
                        {availableContracts.map(({ tradeType, id }) => (
                            <Checkbox
                                checked={changedOptions.includes(id)}
                                checkboxPosition='right'
                                className='filter__item'
                                id={id}
                                key={id}
                                label={tradeType}
                                onChange={onChange}
                                size='md'
                            />
                        ))}
                    </ActionSheet.Content>
                    <ActionSheet.Footer
                        alignment='vertical'
                        isSecondaryButtonDisabled={!changedOptions.length}
                        primaryAction={{
                            content: <Localize i18n_default_text='Apply' />,
                            onAction: () => onApplyContractTypeFilter(changedOptions),
                        }}
                        secondaryAction={{
                            content: <Localize i18n_default_text='Clear All' />,
                            onAction: () => setChangedOptions([]),
                        }}
                        shouldCloseOnSecondaryButtonClick={false}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </React.Fragment>
    );
};

export default ContractTypeFilter;
