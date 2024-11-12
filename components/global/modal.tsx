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
interface ModalStackItem {
  element: React.ReactElement;
  metadata: ModalMetadata;
  key: string;
}

// Add metadata type definition
interface ModalMetadata {
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
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
    metadata?: ModalMetadata,
  ): string {
    if (!this.setModalStack) {
      console.warn('ModalManager not initialized');
      return '';
    }
    const id = uniqueId();
    Component.displayName = id;
    this.setModalStack(prev => {
      return [
        ...prev,
        {
          element: <Component key={id} dismiss={() => this.hideModal(id)} {...(props as T)} />,
          metadata: metadata || {},
          key: id,
        },
      ];
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

    const { element, metadata } = modalStack[index];

    return (
      <Modal
        animationType={metadata.transparent ? undefined : (metadata.animationType ?? 'slide')}
        presentationStyle={metadata.transparent ? undefined : (metadata.presentationStyle ?? 'pageSheet')}
        transparent={metadata.transparent ?? undefined}
        visible
      >
        {element}
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

// Update the hook to include metadata parameter
export const useModal = () => ({
  showModal: <T extends ModalComponentProps>(
    Component: React.ComponentType<WithDismiss<T>>,
    props?: Omit<T, keyof BaseModalProps>,
    metadata?: ModalMetadata,
  ) => ModalManager.showModal(Component, props, metadata),
  hideModal: (id: string) => ModalManager.hideModal(id),
});
