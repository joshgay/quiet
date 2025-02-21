import { EntityState } from '@reduxjs/toolkit'
import { FileMetadata } from '../files/files.types'
import { ChannelMessage } from '../publicChannels/publicChannels.types'
import { BASE_NOTIFICATION_CHANNEL, RICH_NOTIFICATION_CHANNEL } from '../../constants'

export enum MessageType {
  Empty = -1,
  Basic = 1,
  Image = 2,
  Info = 3,
  File = 4
}

export enum SendingStatus {
  Pending = 0,
  Sent = 1
}

export interface SendMessagePayload {
  message: ChannelMessage
  peerId: string
}

export interface PushNotificationPayload {
  channel: typeof BASE_NOTIFICATION_CHANNEL | typeof RICH_NOTIFICATION_CHANNEL
  message: string
  username: string
}

export interface WriteMessagePayload {
  message: string
  id?: string
  channelAddress?: string
  type?: MessageType
  media?: FileMetadata
}

export interface PublicKeyMappingPayload {
  publicKey: string
  cryptoKey: CryptoKey
}

export interface AddPublicChannelsMessagesBasePayload {
  channelAddress: string
}

export interface PublicChannelsMessagesBase {
  channelAddress: string
  messages: EntityState<ChannelMessage>
  display: number
}

export interface SetDisplayedMessagesNumberPayload {
  channelAddress: string
  display: number
}

export interface LazyLoadingPayload {
  load: boolean
}

export interface MessageVerificationStatus {
  publicKey: string
  signature: string
  isVerified: boolean
}

export interface MessageSendingStatus {
  id: string
  status: SendingStatus
}

export interface AskForMessagesPayload {
  ids: string[]
  peerId: string
  channelAddress: string
  communityId: string
}

export interface ChannelMessagesIdsResponse {
  ids: string[]
  channelAddress: string
  communityId: string
}
