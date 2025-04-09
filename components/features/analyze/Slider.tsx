import React from 'react';

import { Slider } from 'react-native-elements';

type CustomSliderProps = {
  value?: number;
  onSlidingComplete?: (value: number) => void; // Define the type of onSlidingComplete here
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  [key: string]: any; // Allow other optional props
};

const CustomSlider = ({
  value = 0.07,
  onSlidingComplete,
  minimumValue = 0.02,
  maximumValue = 1,
  step = 0.01,
  ...props
}: CustomSliderProps) => (
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
