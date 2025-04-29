import React from 'react';

import renderer from 'react-test-renderer';

import { Text } from '@/components/base/Text';

describe('Text Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Text>Testing Divizend Companion</Text>).toJSON();
    expect(tree).toBeDefined();
  });
});
