import React from 'react';
import Select from 'react-select';

const options = [
  { value: 'cnn', label: 'CNN' },
  { value: 'the-new-york-times', label: 'The New York Times' },
  { value: 'usa-today', label: 'USA Today' }
];

class App extends React.Component {
  state = {
    selectedOption: null,
  }
  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  }
  render() {
    const { selectedOption } = this.state;

    return (
      <Select
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      />
    );
  }
}