import React, { memo, useMemo, useState } from "react";
import {
  Autocomplete,
  GoogleMap,
  Libraries,
  useJsApiLoader,
} from "@react-google-maps/api";

import {
  Button,
  Autocomplete as MatAutocomplete,
  TextField,
} from "@mui/material";
import { getGeocode, getLatLng } from "use-places-autocomplete";

export function decodeGeocoderResult(data: google.maps.GeocoderResult[]):
  | {
      state: string;
      city: string;
      zipCode: string;
      country: string;
      formatted_address: string;
    }
  | undefined {
  const result = {
    state: "",
    city: "",
    zipCode: "",
    country: "",
    formatted_address: "",
  };

  const address_components = data?.[0]?.address_components;
  if (!address_components.length) return;
  result.formatted_address = data?.[0].formatted_address;
  address_components.forEach((value) => {
    const type = value.types[0];
    switch (type) {
      case "locality":
        result.city = value.long_name;
        break;
      case "administrative_area_level_1":
        result.state = value.long_name;
        break;
      case "postal_code":
        result.zipCode = value.long_name;
        break;
      case "country":
        result.country = value.long_name;
        break;
      default:
        break;
    }
  });

  return result;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

function Map() {
  const GoogleMapApiKey: string | null = localStorage.getItem("api_key") || "";
  const libraries: Libraries = useMemo(() => ["places"], []);

  const [json_data, set_json_data] = useState({});

  //STATES
  //--Google Maps
  const [center, setCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 29.57428043673804,
    lng: 74.34091367876584,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);

  //--AutoComplete
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  //--MatAutoComplete
  const [matAutoCompleteOptions, setMatAutoCompleteOptions] = useState<
    { label: string }[]
  >([]);
  const [inputDebounceTimeout, setInputDebounceTimeout] = useState<
    number | null
  >(null);

  //script
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GoogleMapApiKey,
    libraries: libraries,
  });

  //Form submit
  async function onSubmit() {
    const newCenter = map?.getCenter();
    if (!newCenter) return;
    const location = { coordinates: [newCenter.lng(), newCenter.lat()] };

    const addressDetails = await handleReverseGeocoding(
      location.coordinates[1],
      location.coordinates[0]
    );
    if (!addressDetails) return;
    const other = decodeGeocoderResult(addressDetails);
    if (!other?.zipCode) return console.error("try another location");
    console.log(other, location);
    set_json_data({
      location,
      ...other,
    });
  }

  //GoogleMap handlers
  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);

    setMap(map);
  }, []);
  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  async function onDragEnd() {
    const newCenter = map?.getCenter();
    if (!newCenter) return;
    const newLocation = { lat: newCenter.lat(), lng: newCenter.lng() };
    console.log({ newLocation });
  }

  const handleReverseGeocoding = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      const result = await getGeocode({
        location: { lat: latitude, lng: longitude },
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  //Mat AutoComplete handlers
  const handleInputChange = (value: string) => {
    if (!value) return;

    // Clear the previous timeout to avoid immediate function call
    if (inputDebounceTimeout) {
      clearTimeout(inputDebounceTimeout);
    }

    // Set a new timeout to delay the function call
    setInputDebounceTimeout(
      setTimeout(() => {
        // Perform the desired action with the debounced value here
        handleSearch(value);
      }, 500) // Adjust the debounce time (milliseconds) as per your requirements
    );
  };
  const handleSearch = (value: string) => {
    if (autocompleteService) {
      autocompleteService.getPlacePredictions(
        {
          input: value,
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const options = predictions?.map(
              (prediction) => prediction.description
            );
            if (options)
              setMatAutoCompleteOptions(() =>
                options?.map((v) => ({ label: v }))
              );
            console.log({ options });
          }
        }
      );
    }
  };
  const handleSelection = async (
    _event: React.SyntheticEvent<Element, Event>,
    value: { label: string } | null
  ) => {
    if (!value?.label) return;
    try {
      //getGeocode() //state city country , postal code
      const result = await getGeocode({ address: value.label });
      // getLatLng()
      const { lat, lng } = await getLatLng(result[0]);
      setCenter({ lat, lng });
    } catch (error) {
      console.error(error);
    }
  };

  //UI

  if (!isLoaded) return <div>...Loading</div>;

  return (
    <div className="Map-component ">
      <div className="Map-component-map-view custom-center-marker">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            clickableIcons: false,
            fullscreenControl: false,
            streetViewControl: false,
            disableDefaultUI: true,
            zoomControl: false,
            keyboardShortcuts: false,
          }}
          onDragEnd={onDragEnd}
        >
          <Autocomplete
            onLoad={() => {
              setAutocompleteService(
                new google.maps.places.AutocompleteService()
              );
            }}
          >
            <input type="text" hidden />
          </Autocomplete>
          <></>
        </GoogleMap>
      </div>

      <div className="api_key_input">
        <TextField
          id="outlined-basic"
          defaultValue={localStorage.getItem("api_key") || ""}
          onChange={(e) => {
            localStorage.setItem("api_key", e.target.value);
          }}
          label="Api Key"
          variant="outlined"
          placeholder="place you api secret key here,"
          fullWidth
          type="password"
        />
      </div>
      <div className="Map-component-form-view flex justify-center">
        <div className=" max-w-sm">
          <div className="mt-2 w-full">
            <MatAutocomplete
              fullWidth
              disablePortal
              id="combo-box-demo"
              options={matAutoCompleteOptions}
              onChange={handleSelection}
              isOptionEqualToValue={() => true}
              onInputChange={(_event, newInputValue) => {
                handleInputChange(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="dense"
                  label="Search location"
                  placeholder="Enter your area or apartment name"
                />
              )}
            />
          </div>
          <Button type="button" onClick={onSubmit} variant="contained">
            Update json
          </Button>
        </div>
        <div>
          <pre>{JSON.stringify(json_data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

const MyMap = memo(Map);

export default MyMap;
