import { createRootCA } from '@quiet/identity'
import { AsyncReturnType } from '../../utils/types/AsyncReturnType.interface'
import { HiddenService, PeerId, Identity } from '../identity/identity.types'
import { Community } from './communities.slice'

export enum CommunityOwnership {
  Owner = 'owner',
  User = 'user'
}

export interface NetworkData {
  hiddenService: HiddenService
  peerId: PeerId
}

export interface CreateNetworkPayload {
  ownership: CommunityOwnership
  name?: string
  registrar?: string
}

export interface ResponseCreateNetworkPayload {
  community: Community
  network: NetworkData
}

export interface Certificates {
  certificate: string
  key: string
  CA: string[]
}

export interface InitCommunityPayload {
  id: string
  peerId: PeerId
  hiddenService: HiddenService
  certs: Certificates
  peers?: string[]
}

export interface UpdateCommunityPayload {
  id: string
  rootCa: string
}

export interface AddNewCommunityPayload {
  id: string
  name: string
  CA: AsyncReturnType<typeof createRootCA> | {}
  registrarUrl: string
}

export interface LaunchRegistrarPayload {
  id: string
  peerId: string
  rootCertString: string
  rootKeyString: string
  privateKey?: string
  port?: number
}

export interface ResponseRegistrarPayload {
  id: string
  payload: Partial<Community>
}

export interface StorePeerListPayload {
  communityId: string
  peerList: string[]
}

export interface UpdatePeerListPayload {
  communityId: string
  peerId: string
}

export interface ResponseCreateCommunityPayload {
  id: string
  payload: Partial<Identity>
}

export interface ResponseLaunchCommunityPayload {
  id: string
}

export interface UpdateRegistrationAttemptsPayload {
  id: string
  registrationAttempts: number
}
