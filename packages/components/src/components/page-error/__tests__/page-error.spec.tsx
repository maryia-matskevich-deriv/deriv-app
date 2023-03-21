import React from 'react';
import { Router } from 'react-router-dom';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBrowserHistory } from 'history';
import PageError from '../index';

describe('<PageError/>', () => {
    let history;
    const renderWithRouter = component => {
        history = createBrowserHistory();
        return render(<Router history={history}>{component}</Router>);
    };

    const props = {
        header: 'test header message',
        messages: ['test message'],
        redirect_labels: ['testlabel'],
        redirect_urls: ['/test'],
        should_clear_error_on_click: true,
        buttonOnClick: jest.fn(),
        setError: jest.fn(),
        should_redirect: true,
    };

    it('should call buttonOnClick() by button click when should_redirect, should_clear_error_on_click equal false', () => {
        const buttonOnClick = jest.fn();
        render(
            <PageError
                {...props}
                should_clear_error_on_click={false}
                buttonOnClick={buttonOnClick}
                should_redirect={false}
            />
        );
        expect(screen.getByRole('button')).toHaveClass('dc-page-error__btn--no-redirect');
        userEvent.click(screen.getByRole('button'));
        expect(buttonOnClick).toHaveBeenCalledTimes(1);
    });
    it('should call setError() when redirect button get clicked', () => {
        const setError = jest.fn();
        renderWithRouter(<PageError {...props} should_redirect={true} setError={setError} />);
        const link = screen.getByRole('link');
        userEvent.click(link);
        expect(setError).toHaveBeenCalledTimes(1);
    });
});
