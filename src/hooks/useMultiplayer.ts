import { useState, useEffect, useCallback, useRef } from 'react'
import { Peer, type DataConnection } from 'peerjs'
import type { Cursor, MultiplayerEvent } from '../types'

interface UseMultiplayerProps {
  onStateSync: (payload: any) => void
  onCursorMove: (player: 1 | 2, cursor: Cursor) => void
  onSelect: (player: 1 | 2, index: number) => void
  onAudioPlay: (sound: 'move' | 'gong') => void
  onGuestJoined: () => void
}

export function useMultiplayer({
  onStateSync,
  onCursorMove,
  onSelect,
  onAudioPlay,
  onGuestJoined
}: UseMultiplayerProps) {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isHost, setIsHost] = useState(true)

  const [remoteCursor, setRemoteCursor] = useState<Cursor>({ x: 0, y: 0 })
  const [remoteSelectedIndex, setRemoteSelectedIndex] = useState<number | null>(null)

  const connectionRef = useRef<DataConnection | null>(null)

  const callbacksRef = useRef({ onStateSync, onCursorMove, onSelect, onAudioPlay, onGuestJoined })
  useEffect(() => {
    callbacksRef.current = { onStateSync, onCursorMove, onSelect, onAudioPlay, onGuestJoined }
  }, [onStateSync, onCursorMove, onSelect, onAudioPlay, onGuestJoined])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const room = urlParams.get('room')
    
    const peer = new Peer()

    const setupHeartbeat = (conn: DataConnection) => {
      let timeoutId: number | undefined
      let pingInterval: number | undefined

      const dropConnection = () => {
        setIsConnected(false)
        connectionRef.current = null
      }

      const resetTimeout = () => {
        clearTimeout(timeoutId)
        timeoutId = window.setTimeout(dropConnection, 6000) // Drops if silent for 6 seconds
      }

      conn.on('open', () => {
        resetTimeout()
        pingInterval = window.setInterval(() => {
          if (conn.open) {
            conn.send({ type: 'HEARTBEAT' } as MultiplayerEvent)
          }
        }, 2000) // Pings every 2 seconds
      })

      conn.on('data', () => resetTimeout())

      conn.on('close', () => {
        clearInterval(pingInterval)
        clearTimeout(timeoutId)
        dropConnection()
      })

      conn.on('error', () => {
        clearInterval(pingInterval)
        clearTimeout(timeoutId)
        dropConnection()
      })
    }

    if (room) {
      setIsHost(false)
      peer.on('open', () => {
        const conn = peer.connect(room)
        setupHeartbeat(conn)
        
        conn.on('open', () => {
          connectionRef.current = conn
          setIsConnected(true)
        })
        conn.on('data', (data: unknown) => {
          const event = data as MultiplayerEvent
          if (event.type === 'HEARTBEAT') return
          if (event.type === 'STATE_SYNC') callbacksRef.current.onStateSync(event.payload)
          if (event.type === 'CURSOR_MOVE') {
            setRemoteCursor(event.cursor)
            callbacksRef.current.onCursorMove(event.player, event.cursor)
          }
          if (event.type === 'SELECT') {
            setRemoteSelectedIndex(event.index)
            callbacksRef.current.onSelect(event.player, event.index)
          }
          if (event.type === 'AUDIO_PLAY') callbacksRef.current.onAudioPlay(event.sound)
        })
      })
    } else {
      setIsHost(true)
      peer.on('open', (id) => setPeerId(id))
      peer.on('connection', (conn) => {
        setupHeartbeat(conn)

        // IMPORTANTE: Só envia dados pesados depois que a porta de dados tiver 100% aberta
        conn.on('open', () => {
          connectionRef.current = conn
          setIsConnected(true)
          callbacksRef.current.onGuestJoined()
        })

        conn.on('data', (data: unknown) => {
          const event = data as MultiplayerEvent
          if (event.type === 'HEARTBEAT') return
          if (event.type === 'CURSOR_MOVE') {
            setRemoteCursor(event.cursor)
            callbacksRef.current.onCursorMove(event.player, event.cursor)
          }
          if (event.type === 'SELECT') {
            setRemoteSelectedIndex(event.index)
            callbacksRef.current.onSelect(event.player, event.index)
          }
          if (event.type === 'AUDIO_PLAY') callbacksRef.current.onAudioPlay(event.sound)
        })
      })
    }

    return () => {
      peer.destroy()
    }
  }, [])

  const sendEvent = useCallback((event: MultiplayerEvent) => {
    if (connectionRef.current && connectionRef.current.open) {
      connectionRef.current.send(event)
    }
  }, [])

  return {
    peerId,
    isConnected,
    isHost,
    remoteCursor,
    remoteSelectedIndex,
    sendEvent
  }
}
