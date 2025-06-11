import {
    Box,
    Button,
    Select,
    MenuItem,
    Typography,
  } from "@mui/material";
  import { useContext, useState, useEffect } from "react";
  import { Formik } from "formik";
  import * as yup from "yup";
  import useMediaQuery from "@mui/material/useMediaQuery";
  import Header from "../../components/Header";
  import { LoginContext } from "../../LoginContext";
  
  const Form = () => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const { user, setUser } = useContext(LoginContext);
    const [bikeDescriptions, setBikeDescriptions] = useState([]);
    const [loadingDescriptions, setLoadingDescriptions] = useState(false);
    const [state, setState] = useState("");
    const [modelYear, setModelYear] = useState("");
  
    // Fetch bike descriptions
    const fetchBikeDescriptions = async (state, modelYear) => {
      if (!state || !modelYear) return; // Evitar solicitudes innecesarias
    
      setLoadingDescriptions(true);
      try {
        console.log("Fetching descriptions for:", { state, modelYear });
        const response = await fetch(
          `https://motocfapi-470191599805.us-central1.run.app/getMotoOptions?ciudad=${state}&anio=${modelYear}`
        );
    
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched descriptions:", data);
          setBikeDescriptions(data);
        } else {
          console.error("Failed to fetch bike descriptions");
        }
      } catch (error) {
        console.error("Error fetching bike descriptions:", error);
      } finally {
        setLoadingDescriptions(false);
      }
    };
  
    // Trigger fetching bike descriptions when state or modelYear changes
    useEffect(() => {
      fetchBikeDescriptions(state, modelYear);
    }, [state, modelYear]);
  
    return (
      <Box m="20px">
        <Header
          title="Formulario de Selección de Moto"
          subtitle="Completa los campos con la información solicitada"
        />
  
        <Formik
          initialValues={{
            state: "",
            modelYear: "",
            bikeDescription: "",
          }}
          validationSchema={yup.object().shape({
            state: yup.string().required("Selecciona el estado"),
            modelYear: yup.string().required("Selecciona el modelo"),
            bikeDescription: yup.string().required("Selecciona una descripción"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            console.log("Final Submit Values:", values);
            setSubmitting(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            setFieldValue,
          }) => (
            <form>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <Select
                  fullWidth
                  variant="filled"
                  name="state"
                  displayEmpty
                  onBlur={handleBlur}
                  onChange={(e) => {
                    setFieldValue("state", e.target.value);
                    setState(e.target.value); // Update state
                  }}
                  value={values.state}
                  error={touched.state && Boolean(errors.state)}
                  sx={{ gridColumn: "span 4" }}
                >
                  <MenuItem disabled value="">
                    <em>Estado en que circula la moto</em>
                  </MenuItem>
                  <MenuItem value="CDMX">CDMX</MenuItem>
                </Select>
  
                <Select
                  fullWidth
                  variant="filled"
                  name="modelYear"
                  displayEmpty
                  onBlur={handleBlur}
                  onChange={(e) => {
                    setFieldValue("modelYear", e.target.value);
                    setModelYear(e.target.value); // Update modelYear
                  }}
                  value={values.modelYear}
                  error={touched.modelYear && Boolean(errors.modelYear)}
                  sx={{ gridColumn: "span 4" }}
                >
                  <MenuItem disabled value="">
                    <em>Modelo de Moto</em>
                  </MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                </Select>
  
                <Select
                  fullWidth
                  variant="filled"
                  name="bikeDescription"
                  displayEmpty
                  onBlur={handleBlur}
                  onChange={(e) => setFieldValue("bikeDescription", e.target.value)}
                  value={values.bikeDescription}
                  error={touched.bikeDescription && Boolean(errors.bikeDescription)}
                  sx={{ gridColumn: "span 4" }}
                >
                  <MenuItem disabled value="">
                    <em>
                      {loadingDescriptions ? "Cargando opciones..." : "Descripción de la Moto"}
                    </em>
                  </MenuItem>
                  {!loadingDescriptions &&
                    bikeDescriptions.map((desc, index) => (
                      <MenuItem key={index} value={desc.NomSeleccion}>
                        {desc.NomSeleccion}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
  
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Cotizar
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    );
  };
  
  export default Form;
  