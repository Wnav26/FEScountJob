import React, { useEffect, useRef, useState } from 'react';
import { Spin, Button, Alert, message } from 'antd';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onClose?: () => void;
}

const JitsiMeetComponent: React.FC<JitsiMeetProps> = ({ roomName, displayName, onClose }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tạo một hàm để khởi tạo Jitsi
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Kiểm tra nếu script đã được tải
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        // Tạo script element
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Không thể tải Jitsi Meet API'));
        
        // Thêm script vào document
        document.body.appendChild(script);
      });
    };

    // Hàm khởi tạo Jitsi API
    const initializeJitsi = () => {
      try {
        if (!window.JitsiMeetExternalAPI) {
          throw new Error('Jitsi Meet API không được tải');
        }

        if (!jitsiContainerRef.current) {
          throw new Error('Không tìm thấy container cho Jitsi Meet');
        }

        // Cấu hình Jitsi
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            enableWelcomePage: false,
            enableClosePage: false,
            defaultLanguage: 'vi',
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#3c3c3c',
            DEFAULT_REMOTE_DISPLAY_NAME: 'Người tham gia',
            TOOLBAR_ALWAYS_VISIBLE: true,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            MOBILE_APP_PROMO: false,
          }
        };

        // Khởi tạo Jitsi API
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        // Thêm các event listeners
        jitsiApiRef.current.addEventListeners({
          readyToClose: handleClose,
          videoConferenceJoined: () => {
            console.log('Đã tham gia phòng họp');
            setLoading(false);
          },
          participantJoined: (participant: any) => {
            console.log(`Người tham gia đã vào: ${participant.displayName}`);
          },
          participantLeft: (participant: any) => {
            console.log(`Người tham gia đã rời: ${participant.displayName}`);
          },
          audioMuteStatusChanged: (muted: boolean) => {
            console.log(`Microphone ${muted ? 'đã tắt' : 'đã bật'}`);
          },
          videoMuteStatusChanged: (muted: boolean) => {
            console.log(`Camera ${muted ? 'đã tắt' : 'đã bật'}`);
          },
          // Thêm sự kiện xử lý lỗi
          error: (error: any) => {
            console.error('Jitsi error:', error);
            setError(`Lỗi: ${error.message || 'Không xác định'}`);
            setLoading(false);
          }
        });

        // Đặt timeout để tránh loading vô hạn
        setTimeout(() => {
          if (loading) {
            setLoading(false);
          }
        }, 10000); // 10 giây timeout
      } catch (err: any) {
        console.error('Error initializing Jitsi:', err);
        setError(err.message || 'Không thể khởi tạo phòng họp');
        setLoading(false);
      }
    };

    // Tải script và khởi tạo Jitsi
    loadJitsiScript()
      .then(() => {
        initializeJitsi();
      })
      .catch((err) => {
        console.error('Error loading Jitsi script:', err);
        setError('Không thể tải Jitsi Meet API. Vui lòng kiểm tra kết nối internet của bạn.');
        setLoading(false);
      });

    // Cleanup function
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName, displayName]);

  const handleClose = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 10
        }}>
          <Spin tip="Đang kết nối phòng họp..." size="large" />
        </div>
      )}
      
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 20
        }}>
          <Alert
            message="Lỗi kết nối"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, width: '100%', maxWidth: 500 }}
          />
          <Button type="primary" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      )}
      
      <div 
        ref={jitsiContainerRef} 
        style={{ width: '100%', height: '100%' }}
        id="jitsi-container"
      />
    </div>
  );
};

export default JitsiMeetComponent;