import React, { useState } from 'react';
import { useCombobox, UseComboboxStateChange } from 'downshift';
import { useField } from 'formik';
import { useQuery } from 'react-query';
import { Stop } from './../types/Stop';

function fetchAutocomplete(
  key: string,
  queryText: string,
  countryCode?: string
): Promise<Stop[]> {
  const apiKey = process.env.REACT_APP_ROUTING_API_KEY || '';
  if (!queryText) {
    return Promise.resolve([]);
  }

  const params = new URLSearchParams();
  params.append('api_key', apiKey);
  params.append('text', queryText);
  if (countryCode) {
    params.append('boundary.country', countryCode);
  }

  return window
    .fetch(
      `https://api.openrouteservice.org/geocode/autocomplete?${params.toString()}`
    )
    .then(async (res) => {
      const data = await res.json();
      const stops = data.features as Stop[];
      return stops.map((item) => {
        const {
          type,
          geometry,
          properties: { name, label },
        } = item;
        const formatted = { type, geometry, properties: { name, label } };
        return formatted;
      });
    });
}

type ControlledAutocompleteProps = {
  name: string;
  onAddClick: () => void;
  countryCode?: string;
};

export default function ControlledAutocomplete({
  name,
  onAddClick,
  countryCode,
}: ControlledAutocompleteProps): JSX.Element {
  const [, meta, helpers] = useField(name);
  const { value } = meta;
  const { setValue } = helpers;
  const [queryText, setQueryText] = useState('');
  const { data } = useQuery(
    ['findStop', queryText, countryCode],
    fetchAutocomplete
  );

  const inputItems = data || [];

  function handleInputValueChange({
    inputValue,
  }: UseComboboxStateChange<Stop>): void {
    setQueryText(inputValue || '');
  }

  function handleSelectedItemChange({
    selectedItem,
  }: UseComboboxStateChange<Stop>): void {
    setValue(selectedItem);
    setQueryText(selectedItem ? selectedItem.properties.label : '');
  }
  return (
    <>
      <DropdownCombobox
        items={inputItems}
        selectedItem={value}
        onSelectedItemChange={handleSelectedItemChange}
        inputValue={queryText}
        onInputValueChange={handleInputValueChange}
        onAddClick={onAddClick}
      />
    </>
  );
}

type DropdownComboboxProps = {
  items: Stop[];
  selectedItem: Stop;
  onSelectedItemChange: (changes: UseComboboxStateChange<Stop>) => void;
  inputValue: string;
  onInputValueChange: (changes: UseComboboxStateChange<Stop>) => void;
  onAddClick: () => void;
};

function DropdownCombobox({
  items,
  selectedItem,
  onSelectedItemChange,
  inputValue,
  onInputValueChange,
  onAddClick,
}: DropdownComboboxProps): JSX.Element {
  const itemToString: (item: Stop | null) => string = (item: Stop | null) =>
    item ? item.properties.label : '' || '';

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    itemToString,
    selectedItem,
    onSelectedItemChange,
    onInputValueChange: onInputValueChange,
    inputValue,
  });

  return (
    <div className="flex flex-col w-full h-64 my-3 space-y-2">
      <label {...getLabelProps()}>Add a stop:</label>
      <div {...getComboboxProps()} className="flex flex-row space-x-4">
        <input
          {...getInputProps()}
          className="flex-grow p-3 border border-gray-500 rounded"
        />
        <button
          className="flex items-center self-center justify-center w-8 h-8 p-1 text-2xl bg-teal-500 rounded-full"
          onClick={onAddClick}
          type="button"
        >
          +
        </button>
      </div>
      <ul
        {...getMenuProps()}
        className="flex flex-col flex-grow overflow-y-auto"
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item.properties.name}-${index}`}
              {...getItemProps({ item, index })}
              className="p-2"
            >
              {itemToString(item)}
            </li>
          ))}
      </ul>
    </div>
  );
}
