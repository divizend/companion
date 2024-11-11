import React from 'react';

import ModalView from '@/components/ModalView';
import { t } from '@/i18n';

import GoalsManager from './GoalsManager';

interface GoalsManagerModalProps {
  visible: boolean;
  onClose: () => void;
  parentGoalId: string | null;
  allowRedetermine?: boolean;
}

export default function GoalsManagerModal({
  visible,
  onClose,
  parentGoalId,
  allowRedetermine,
}: GoalsManagerModalProps): JSX.Element {
  const variant = parentGoalId ? 'secondary' : 'primary';
  return (
    <ModalView visible={visible} onClose={onClose} title={t(`learn.goalsManager.${variant}.title`)}>
      <GoalsManager parentGoalId={parentGoalId} allowRedetermine={allowRedetermine} />
    </ModalView>
  );
}
