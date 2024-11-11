import React, { useState } from 'react';

import { uniqueId } from 'lodash';
import { Modal } from 'react-native';

// Update type definitions
interface BaseModalProps {
  dismiss: () => void;
}

type ModalComponentProps = Record<string, unknown>;

// Helper type to combine base props with component props
type WithDismiss<T> = T & BaseModalProps;

// Add proper type for modal stack items
interface ModalStackItem extends React.ReactElement {
  key: string;
}

// Create a singleton instance to manage modals
class ModalManagerClass {
  private static instance: ModalManagerClass;
  private setModalStack?: React.Dispatch<React.SetStateAction<ModalStackItem[]>>;

  private constructor() {}

  public static getInstance(): ModalManagerClass {
    if (!ModalManagerClass.instance) {
      ModalManagerClass.instance = new ModalManagerClass();
    }
    return ModalManagerClass.instance;
  }

  public init(setModalStackFn: React.Dispatch<React.SetStateAction<ModalStackItem[]>>) {
    this.setModalStack = setModalStackFn;
  }

  public showModal<T extends ModalComponentProps>(
    Component: React.ComponentType<WithDismiss<T>>,
    props?: Omit<T, keyof BaseModalProps>,
  ): string {
    if (!this.setModalStack) {
      console.warn('ModalManager not initialized');
      return '';
    }
    const id = uniqueId();
    Component.displayName = id;
    // @ts-ignore
    this.setModalStack(prev => {
      // @ts-ignore
      return [...prev, <Component key={id} dismiss={() => this.hideModal(id)} {...props} />];
    });
    return id;
  }

  public hideModal(id: string) {
    if (!this.setModalStack) {
      console.warn('ModalManager not initialized');
      return;
    }
    this.setModalStack(prev => prev.filter(item => item.key !== id));
  }
}

export const ModalManager = ModalManagerClass.getInstance();

// Rest of your existing ModalProvider code remains the same, but modified to use the singleton
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalStackItem[]>([]);

  // Initialize the modal manager with the state setter
  React.useEffect(() => {
    ModalManager.init(setModalStack);
  }, []);

  // Your existing renderNestedModals function
  const renderNestedModals = (index: number = 0): React.ReactNode => {
    if (index >= modalStack.length) return null;

    return (
      <Modal animationType="slide" transparent visible key={index}>
        {modalStack[index]}
        {renderNestedModals(index + 1)}
      </Modal>
    );
  };

  return (
    <>
      {children}
      {renderNestedModals(0)}
    </>
  );
};

// Update the hook to match the new types
export const useModal = () => ({
  showModal: <T extends ModalComponentProps>(
    Component: React.ComponentType<WithDismiss<T>>,
    props?: Omit<T, keyof BaseModalProps>,
  ) => ModalManager.showModal(Component, props),
  hideModal: (id: string) => ModalManager.hideModal(id),
});
