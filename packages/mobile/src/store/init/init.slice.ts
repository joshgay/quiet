import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { FixedTask } from 'typed-redux-saga'
import { Socket } from 'socket.io-client'
import { ScreenNames } from '../../const/ScreenNames.enum'
import { StoreKeys } from '../store.keys'
import { initChecksAdapter } from './init.adapter'
import { InitCheck } from './init.types'
import { InitCheckKeys } from './initCheck.keys'

export class InitState {
  public isNavigatorReady: boolean = false
  public isCryptoEngineInitialized: boolean = false
  public isWebsocketConnected: boolean = false
  public lastKnownDataPort: number = 0
  public initDescription: string = ''
  public initChecks: EntityState<InitCheck> = initChecksAdapter.setAll(
    initChecksAdapter.getInitialState(),
    [
      {
        event: InitCheckKeys.Tor,
        passed: false
      },
      {
        event: InitCheckKeys.Backend,
        passed: false
      }
    ]
  )

  public currentScreen: ScreenNames = ScreenNames.SplashScreen
}

export interface InitCheckPayload {
  event: InitCheckKeys
  passed: boolean
}

export interface WebsocketConnectionPayload {
  dataPort: number
}

export interface CloseConnectionPayload {
  task: FixedTask<Generator>
}

export interface SetConnectedPayload {
  socket: Socket
}

export const initSlice = createSlice({
  initialState: { ...new InitState() },
  name: StoreKeys.Init,
  reducers: {
    setNavigatorReady: (state, action: PayloadAction<boolean>) => {
      state.isNavigatorReady = action.payload
    },
    setCryptoEngineInitialized: (state, action: PayloadAction<boolean>) => {
      state.isCryptoEngineInitialized = action.payload
    },
    onRestore: state => state,
    setStoreReady: state => state,
    updateInitDescription: (state, action: PayloadAction<string>) => {
      state.initDescription = action.payload
    },
    updateInitCheck: (state, action: PayloadAction<InitCheckPayload>) => {
      const { event, passed } = action.payload
      initChecksAdapter.updateOne(state.initChecks, {
        changes: {
          event: event,
          passed: passed
        },
        id: event
      })
    },
    startWebsocketConnection: (state, _action: PayloadAction<WebsocketConnectionPayload>) => state,
    suspendWebsocketConnection: state => {
      state.isWebsocketConnected = false
    },
    setWebsocketConnected: (state, action: PayloadAction<WebsocketConnectionPayload>) => {
      const { dataPort } = action.payload
      state.isWebsocketConnected = true
      state.lastKnownDataPort = dataPort
      const event = InitCheckKeys.Backend
      initChecksAdapter.updateOne(state.initChecks, {
        changes: {
          event: event,
          passed: true
        },
        id: event
      })
    },
    setCurrentScreen: (state, action: PayloadAction<ScreenNames>) => {
      state.currentScreen = action.payload
    }
  }
})

export const initActions = initSlice.actions
export const initReducer = initSlice.reducer
