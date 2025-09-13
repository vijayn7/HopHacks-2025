import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface EventQRCodeProps {
  eventId: string;
  size?: number;
}

/**
 * Displays a QR code representing the provided event ID.
 */
const EventQRCode: React.FC<EventQRCodeProps> = ({ eventId, size = 200 }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <QRCode value={eventId} size={size} />
    </View>
  );
};

export default EventQRCode;
