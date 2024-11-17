import React from 'react';

import { Slider } from 'react-native-elements';

const CustomSlider = ({
  value = 0.07,
  onSlidingComplete,
  minimumValue = 0.02,
  maximumValue = 1,
  step = 0.01,
  ...props
}) => (
  <Slider
    value={value}
    onSlidingComplete={onSlidingComplete}
    minimumValue={minimumValue}
    maximumValue={maximumValue}
    step={step}
    {...props}
  />
);

export default CustomSlider;
