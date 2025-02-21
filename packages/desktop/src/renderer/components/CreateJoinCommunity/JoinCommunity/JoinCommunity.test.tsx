import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { screen, waitFor } from '@testing-library/dom'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { renderComponent } from '../../../testUtils/renderComponent'
import { prepareStore } from '../../../testUtils/prepareStore'
import { StoreKeys } from '../../../store/store.keys'
import { SocketState } from '../../../sagas/socket/socket.slice'
import { ModalName } from '../../../sagas/modals/modals.types'
import { ModalsInitialState } from '../../../sagas/modals/modals.slice'
import JoinCommunity from './JoinCommunity'
import CreateCommunity from '../CreateCommunity/CreateCommunity'
import { JoinCommunityDictionary, CreateCommunityDictionary } from '../community.dictionary'
import CreateUsername from '../../CreateUsername/CreateUsername'
import PerformCommunityActionComponent from '../PerformCommunityActionComponent'
import { inviteLinkField } from '../../../forms/fields/communityFields'
import { InviteLinkErrors } from '../../../forms/fieldsErrors'
import { CommunityOwnership } from '@quiet/state-manager'

describe('join community', () => {
  it('users switches from join to create', async () => {
    const { store } = await prepareStore({
      [StoreKeys.Socket]: {
        ...new SocketState(),
        isConnected: true
      },
      [StoreKeys.Modals]: {
        ...new ModalsInitialState(),
        [ModalName.joinCommunityModal]: { open: true }
      }
    })

    renderComponent(
      <>
        <JoinCommunity />
        <CreateCommunity />
      </>,
      store
    )

    // Confirm proper modal title is displayed
    const joinCommunityDictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.getByText(joinCommunityDictionary.header)
    expect(joinCommunityTitle).toBeVisible()

    // Click redirecting link
    const link = screen.getByTestId('JoinCommunityLink')
    userEvent.click(link)

    // Confirm user is being redirected to create community
    const createCommunityDictionary = CreateCommunityDictionary()
    const createCommunityTitle = await screen.findByText(createCommunityDictionary.header)
    expect(createCommunityTitle).toBeVisible()
  })

  it.skip('user goes from joning community to username registration, then comes back', async () => {
    const { store } = await prepareStore({
      [StoreKeys.Socket]: {
        ...new SocketState(),
        isConnected: true
      },
      [StoreKeys.Modals]: {
        ...new ModalsInitialState(),
        [ModalName.joinCommunityModal]: { open: true }
      }
    })

    renderComponent(
      <>
        <JoinCommunity />
        <CreateUsername />
      </>,
      store
    )

    // Confirm proper modal title is displayed
    const dictionary = JoinCommunityDictionary()
    const joinCommunityTitle = screen.getByText(dictionary.header)
    expect(joinCommunityTitle).toBeVisible()

    // Enter community address and hit button
    const joinCommunityInput = screen.getByPlaceholderText(dictionary.placeholder)
    const joinCommunityButton = screen.getByText(dictionary.button)
    userEvent.type(joinCommunityInput, '3lyn5yjwwb74he5olv43eej7knt34folvrgrfsw6vzitvkxmc5wpe4yd')
    userEvent.click(joinCommunityButton)

    // Confirm user is being redirected to username registration
    const createUsernameTitle = await screen.findByText('Register a username')
    expect(createUsernameTitle).toBeVisible()

    // Close username registration modal
    const closeButton = await screen.findByTestId('createUsernameModalActions')
    userEvent.click(closeButton)
    expect(joinCommunityTitle).toBeVisible()
  })

  it('joins community on submit if connection is ready and registrar url is correct', async () => {
    const registrarUrl = 'nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2olad'

    const handleCommunityAction = jest.fn()

    const component = <PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={handleCommunityAction}
      handleRedirection={() => { }}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />

    const result = renderComponent(component)

    const textInput = result.queryByPlaceholderText(inviteLinkField().fieldProps.placeholder)
    expect(textInput).not.toBeNull()

    userEvent.type(textInput, registrarUrl)

    const submitButton = result.getByText('Continue')
    expect(submitButton).toBeEnabled()
    userEvent.click(submitButton)

    await waitFor(() => expect(handleCommunityAction).toBeCalledWith(registrarUrl))
  })

  it('trims whitespaces from registrar url', async () => {
    const registrarUrl = 'nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2olad    '

    const handleCommunityAction = jest.fn()

    const component = <PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={handleCommunityAction}
      handleRedirection={() => { }}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />

    const result = renderComponent(component)

    const textInput = result.queryByPlaceholderText(inviteLinkField().fieldProps.placeholder)
    expect(textInput).not.toBeNull()

    userEvent.type(textInput, registrarUrl)

    const submitButton = result.getByText('Continue')
    expect(submitButton).toBeEnabled()
    userEvent.click(submitButton)

    await waitFor(() => expect(handleCommunityAction).toBeCalledWith(registrarUrl.trim()))
  })

  it.each([
    ['http://nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2olad.onion', InviteLinkErrors.WrongCharacter],
    ['nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2ola09bp2', InviteLinkErrors.ValueTooLong],
    ['nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2ola!', InviteLinkErrors.WrongCharacter],
    ['nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2ola ', InviteLinkErrors.ValueTooShort],
    ['nqnw4kc4c77fb47lk52m5l57h4tc', InviteLinkErrors.ValueTooShort]
  ])('user inserting invalid url %s should see "%s" error', async (url: string, error: string) => {
    const handleCommunityAction = jest.fn()

    renderComponent(<PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={handleCommunityAction}
      handleRedirection={() => { }}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />)

    const input = screen.getByPlaceholderText('Invite code')
    const button = screen.getByText('Continue')

    userEvent.type(input, url)
    userEvent.click(button)

    await waitFor(() => expect(handleCommunityAction).not.toBeCalled())

    const message = await screen.findByText(error)
    expect(message).toBeVisible()
  })

  it('blocks submit button if connection is not ready', async () => {
    const handleCommunityAction = jest.fn()

    const component = <PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={handleCommunityAction}
      handleRedirection={() => { }}
      isConnectionReady={false}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />

    const result = renderComponent(component)

    const textInput = result.queryByPlaceholderText(inviteLinkField().fieldProps.placeholder)
    expect(textInput).not.toBeNull()

    userEvent.type(textInput, 'nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2olad')

    const submitButton = result.getByTestId('continue-joinCommunity')
    expect(submitButton).not.toBeNull()
    expect(submitButton).toBeDisabled()

    expect(handleCommunityAction).not.toBeCalled()
  })

  it('shows loading spinner on submit button while waiting for the response', async () => {
    const { rerender } = renderComponent(<PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={() => { }}
      handleRedirection={() => { }}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />)

    const textInput = screen.getByPlaceholderText(inviteLinkField().fieldProps.placeholder)
    userEvent.type(textInput, 'nqnw4kc4c77fb47lk52m5l57h4tcxceo7ymxekfn7yh5m66t4jv2olad')

    const submitButton = screen.getByText('Continue')
    expect(submitButton).toBeEnabled()
    userEvent.click(submitButton)

    await act(async () => {})

    expect(screen.queryByTestId('loading-button-progress')).toBeVisible()

    // Rerender component to verify circular progress has dissapeared
    rerender(<PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={() => { }}
      handleRedirection={() => { }}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={true}
    />)

    expect(screen.queryByTestId('loading-button-progress')).toBeNull()
  })

  it('handles redirection to create community page if user clicks on the link', async () => {
    const handleRedirection = jest.fn()

    const component = <PerformCommunityActionComponent
      open={true}
      handleClose={() => { }}
      communityOwnership={CommunityOwnership.User}
      handleCommunityAction={() => { }}
      handleRedirection={handleRedirection}
      isConnectionReady={true}
      isCloseDisabled={true}
      hasReceivedResponse={false}
    />

    const result = renderComponent(component)

    const switchLink = result.queryByText('create a new community')
    expect(switchLink).not.toBeNull()

    userEvent.click(switchLink)

    expect(handleRedirection).toBeCalled()
  })
})
