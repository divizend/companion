export enum WHTRecoveryClaimantType {
  NATURAL = 'natural',
  JURIDICAL = 'juridical',
}

export function getEntityName(e: any) {
  if (!e?.data?.info) {
    return;
  }
  if (e.data.info.type === WHTRecoveryClaimantType.NATURAL) return e.data.info.givenName + ' ' + e.data.info.surname;
  else if (e.data.info.type === WHTRecoveryClaimantType.JURIDICAL) return e.data.info.name;
}
