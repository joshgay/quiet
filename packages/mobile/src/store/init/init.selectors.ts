import { createSelector } from 'reselect'
import { StoreKeys } from '../store.keys'
import { CreatedSelectors, StoreState } from '../store.types'
import { initChecksAdapter } from './init.adapter'

const initSlice: CreatedSelectors[StoreKeys.Init] = (state: StoreState) =>
  state[StoreKeys.Init]

export const isNavigatorReady = createSelector(
  initSlice,
  (reducerState) => reducerState.isNavigatorReady
)

export const isCryptoEngineInitialized = createSelector(
  initSlice,
  (reducerState) =>
    reducerState.isCryptoEngineInitialized
)

export const isWebsocketConnected = createSelector(
  initSlice,
  (reducerState) =>
    reducerState.isWebsocketConnected
)

export const lastKnownDataPort = createSelector(
  initSlice,
  (reducerState) =>
    reducerState.lastKnownDataPort
)

export const initDescription = createSelector(
  initSlice,
  (reducerState) => reducerState.initDescription
)

export const initChecks = createSelector(
  initSlice,
  (reducerState) =>
    initChecksAdapter.getSelectors().selectAll(reducerState.initChecks)
)

export const currentScreen = createSelector(
  initSlice,
  (reducerState) => reducerState.currentScreen
)

export const initSelectors = {
  isNavigatorReady,
  isCryptoEngineInitialized,
  isWebsocketConnected,
  lastKnownDataPort,
  initDescription,
  initChecks,
  currentScreen
}
