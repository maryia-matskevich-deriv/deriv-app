import React from 'react';
import { useWalletAccountsList } from '@deriv/api-v2';
import { fireEvent, render, screen } from '@testing-library/react';
import { TSubscribedBalance } from '../../../types';
import WalletListCardDropdown from '../WalletListCardDropdown';

const mockSwitchAccount = jest.fn();
jest.mock('@deriv/api-v2', () => ({
    useActiveWalletAccount: jest.fn(() => ({
        data: {
            loginid: '1234567',
        },
    })),
    useAuthorize: jest.fn(() => ({
        switchAccount: mockSwitchAccount,
    })),
    useBalanceSubscription: jest.fn(() => ({
        data: {},
    })),
    useWalletAccountsList: jest.fn(() => ({
        data: [
            {
                currency: 'USD',
                display_balance: '1000.00',
                loginid: '1234567',
            },
            {
                currency: 'BTC',
                display_balance: '1.0000000',
                loginid: '7654321',
            },
        ],
    })),
}));

const mockBalanceData: TSubscribedBalance['balance'] = {
    data: {
        accounts: {
            1234567: {
                balance: 1000.0,
                converted_amount: 1000.0,
                currency: 'USD',
                demo_account: 0,
                status: 1,
                type: 'deriv',
            },
            7654321: {
                balance: 1.0,
                converted_amount: 1.0,
                currency: 'BTC',
                demo_account: 1,
                status: 1,
                type: 'deriv',
            },
        },
        balance: 9990,
        currency: 'USD',
        loginid: 'CRW1314',
    },
    error: undefined,
    isIdle: false,
    isLoading: false,
    isSubscribed: false,
};

describe('WalletListCardDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with the correct data', async () => {
        render(<WalletListCardDropdown balance={mockBalanceData} />);
    });

    it('should switch to selected account on click of the list item', async () => {
        render(<WalletListCardDropdown balance={mockBalanceData} />);

        expect(screen.getByDisplayValue('USD Wallet')).toBeInTheDocument();

        fireEvent.click(screen.getByDisplayValue('USD Wallet'));
        expect(screen.getByText('USD Wallet')).toBeInTheDocument();
        expect(screen.getByText('BTC Wallet')).toBeInTheDocument();
        fireEvent.click(screen.getByText('BTC Wallet'));

        expect(mockSwitchAccount).toHaveBeenCalledWith('7654321');
    });

    it('should render dropdown without crashing when unable to fetch wallets', async () => {
        (useWalletAccountsList as jest.Mock).mockReturnValueOnce({ data: [] });

        render(<WalletListCardDropdown balance={mockBalanceData} />);

        expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
});
