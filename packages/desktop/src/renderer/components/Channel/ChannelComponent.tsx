import React, { useState, useEffect, useLayoutEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'

import Page from '../ui/Page/Page'
import PageHeader from '../ui/Page/PageHeader'

import ChannelHeaderComponent from '../widgets/channels/ChannelHeader'
import ChannelMessagesComponent from '../widgets/channels/ChannelMessages'
import ChannelInputComponent from '../widgets/channels/ChannelInput'

import { INPUT_STATE } from '../widgets/channels/ChannelInput/InputState.enum'

import { useModal, UseModalTypeWrapper } from '../../containers/hooks'

import {
  ChannelMessage,
  DownloadStatus,
  Identity,
  MessagesDailyGroups,
  MessageSendingStatus
} from '@quiet/state-manager'

import { useResizeDetector } from 'react-resize-detector'
import { Dictionary } from '@reduxjs/toolkit'

import UploadFilesPreviewsComponent, {
  UploadFilesPreviewsProps
} from './File/UploadingPreview'

import { DropZoneComponent } from './DropZone/DropZoneComponent'

import { NewMessagesInfoComponent } from './NewMessagesInfo/NewMessagesInfoComponent'

import { FileActionsProps } from './File/FileComponent/FileComponent'

const useStyles = makeStyles(theme => ({
  root: {},
  messages: {
    position: 'relative',
    height: 0,
    backgroundColor: theme.palette.colors.white
  }
}))

export interface ChannelComponentProps {
  user: Identity
  channelAddress: string
  channelName: string
  channelSettingsModal: ReturnType<typeof useModal>
  channelInfoModal: ReturnType<typeof useModal>
  messages: {
    count: number
    groups: MessagesDailyGroups
  }
  newestMessage: ChannelMessage
  pendingMessages: Dictionary<MessageSendingStatus>
  downloadStatuses: Dictionary<DownloadStatus>
  lazyLoading: (load: boolean) => void
  onDelete: () => void
  onInputChange: (value: string) => void
  onInputEnter: (message: string) => void
  openUrl: (url: string) => void
  mutedFlag: boolean
  disableSettings?: boolean
  notificationFilter: string
  openNotificationsTab: () => void
  openFilesDialog: () => void
  handleFileDrop: (arg: any) => void
  isCommunityInitialized: boolean
  handleClipboardFiles?: (arg: ArrayBuffer, ext: string, name: string) => void
  uploadedFileModal?: ReturnType<
  UseModalTypeWrapper<{
    src: string
  }>['types']
  >
}

export const ChannelComponent: React.FC<ChannelComponentProps & UploadFilesPreviewsProps & FileActionsProps> = ({
  user,
  channelAddress,
  channelName,
  channelInfoModal,
  channelSettingsModal,
  messages,
  newestMessage,
  pendingMessages,
  downloadStatuses,
  lazyLoading,
  onDelete,
  onInputChange,
  onInputEnter,
  openUrl,
  mutedFlag,
  disableSettings = false,
  notificationFilter,
  openNotificationsTab,
  removeFile,
  handleFileDrop,
  filesData,
  isCommunityInitialized = true,
  openFilesDialog,
  handleClipboardFiles,
  uploadedFileModal,
  openContainingFolder,
  downloadFile,
  cancelDownload
}) => {
  const classes = useStyles({})

  const [lastSeenMessage, setLastSeenMessage] = useState<string>()
  const [newMessagesInfo, setNewMessagesInfo] = useState<boolean>(false)

  const [infoClass, setInfoClass] = useState<string>(null)

  const [scrollPosition, setScrollPosition] = React.useState(1)
  const [scrollHeight, setScrollHeight] = React.useState(0)

  const onResize = React.useCallback(() => {
    scrollBottom()
  }, [])

  const { ref: scrollbarRef } = useResizeDetector<HTMLDivElement>({ onResize })
  const scrollBottom = () => {
    if (!scrollbarRef.current) return
    setNewMessagesInfo(false)
    setScrollHeight(0)
    scrollbarRef.current?.scrollTo({
      behavior: 'auto',
      top: Math.abs(scrollbarRef.current?.clientHeight - scrollbarRef.current?.scrollHeight)
    })
  }

  const onEnterKeyPress = (message: string) => {
    // Send message and files
    onInputEnter(message)
    // Go back to the bottom if scroll is at the top or in the middle
    scrollBottom()
  }

  /* Get scroll position and save it to the state as 0 (top), 1 (bottom) or -1 (middle) */
  const onScroll = React.useCallback(() => {
    const top = scrollbarRef.current?.scrollTop === 0

    const bottom =
      Math.floor(scrollbarRef.current?.scrollHeight - scrollbarRef.current?.scrollTop) <=
      Math.floor(scrollbarRef.current?.clientHeight)

    let position = -1
    if (top) position = 0
    if (bottom) position = 1

    // Clear new messages info when scrolled back to bottom
    if (bottom) {
      setNewMessagesInfo(false)
    }

    setScrollPosition(position)
  }, [])

  /* Keep scroll position in certain cases */
  useLayoutEffect(() => {
    // Keep scroll at the bottom when new message arrives
    if (scrollbarRef.current && scrollPosition === 1) {
      scrollBottom()
    }
    // Keep scroll position when new chunk of messages is being loaded
    if (scrollbarRef.current && scrollPosition === 0) {
      scrollbarRef.current.scrollTop = scrollbarRef.current.scrollHeight - scrollHeight
    }
  }, [messages])

  /* Lazy loading messages - top (load) */
  useEffect(() => {
    if (scrollbarRef.current.scrollHeight < scrollbarRef.current.clientHeight) return
    if (scrollbarRef.current && scrollPosition === 0) {
      /* Cache scroll height before loading new messages (to keep the scroll position after re-rendering) */
      setScrollHeight(scrollbarRef.current.scrollHeight)
      lazyLoading(true)
    }
  }, [scrollPosition])

  /* Lazy loading messages - bottom (trim) */
  useEffect(() => {
    if (scrollbarRef.current.scrollHeight < scrollbarRef.current.clientHeight) return
    if (scrollbarRef.current && scrollPosition === 1) {
      lazyLoading(false)
    }
  }, [scrollPosition, messages.count])

  useEffect(() => {
    if (
      Math.floor(scrollbarRef.current?.scrollHeight - scrollbarRef.current?.scrollTop) - 1 >=
        Math.floor(scrollbarRef.current?.clientHeight) &&
      lastSeenMessage !== newestMessage.id
    ) {
      setNewMessagesInfo(true)
    }
  }, [scrollPosition, newMessagesInfo, messages])

  useEffect(() => {
    if (scrollPosition === 1 && newestMessage) {
      setLastSeenMessage(newestMessage?.id)
    }
  }, [scrollPosition, messages])

  useEffect(() => {
    scrollBottom()
  }, [channelAddress])

  return (
    <Page>
      <PageHeader>
        <ChannelHeaderComponent
          channelName={channelName}
          onSettings={channelSettingsModal.handleOpen}
          onInfo={channelInfoModal.handleOpen}
          onDelete={onDelete}
          mutedFlag={mutedFlag}
          disableSettings={disableSettings}
          notificationFilter={notificationFilter}
          openNotificationsTab={openNotificationsTab}
        />
      </PageHeader>
      <DropZoneComponent channelName={channelName} handleFileDrop={handleFileDrop}>
        <Grid item xs className={classes.messages}>
          <NewMessagesInfoComponent scrollBottom={scrollBottom} show={newMessagesInfo} />
          <ChannelMessagesComponent
            messages={messages.groups}
            pendingMessages={pendingMessages}
            downloadStatuses={downloadStatuses}
            scrollbarRef={scrollbarRef}
            onScroll={onScroll}
            uploadedFileModal={uploadedFileModal}
            openUrl={openUrl}
            openContainingFolder={openContainingFolder}
            downloadFile={downloadFile}
            cancelDownload={cancelDownload}
          />
        </Grid>
        <Grid item>
          <ChannelInputComponent
            channelAddress={channelAddress}
            channelName={channelName}
            // TODO https://github.com/TryQuiet/ZbayLite/issues/443
            inputPlaceholder={`#${channelName} as @${user?.nickname}`}
            onChange={value => {
              onInputChange(value)
            }}
            onKeyPress={message => {
              onEnterKeyPress(message)
            }}
            openFilesDialog={openFilesDialog}
            infoClass={infoClass}
            setInfoClass={setInfoClass}
            inputState={isCommunityInitialized ? INPUT_STATE.AVAILABLE : INPUT_STATE.NOT_CONNECTED}
            handleClipboardFiles={handleClipboardFiles}
            handleOpenFiles={handleFileDrop}>
            <UploadFilesPreviewsComponent
              filesData={filesData}
              removeFile={id => removeFile(id)}
            />
          </ChannelInputComponent>
        </Grid>
      </DropZoneComponent>
    </Page>
  )
}

export default ChannelComponent
