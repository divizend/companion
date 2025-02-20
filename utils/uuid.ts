import uuid from 'react-native-uuid';

export function generateTransientId(): string {
  return 'transient--' + uuid.v4();
}
