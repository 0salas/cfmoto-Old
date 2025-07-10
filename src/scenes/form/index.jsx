import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Modal,
  Snackbar,
  Alert,
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
  const [apiResponses, setApiResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formSummary, setFormSummary] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [bikeDescriptions, setBikeDescriptions] = useState([]);
  const [loadingDescriptions, setLoadingDescriptions] = useState(false);
  const [state, setState] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [nombreAgenteVentas, setNombreAgenteVentas] = useState("");
  const [detMetodoPagoOptions, setDetMetodoPagoOptions] = useState([]);
  const [imagePopupOpen, setImagePopupOpen] = useState(true);
  // Fetch bike descriptions
  const fetchBikeDescriptions = async (state, modelYear) => {
    if (!state || !modelYear) return;

    setLoadingDescriptions(true);
    try {
      const response = await fetch(
        `https://motocfapi-470191599805.us-central1.run.app/getMotoOptions?ciudad=${state}&anio=${modelYear}?usermail=${user?.email}`
      );
      if (response.ok) {
        const data = await response.json();
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

  useEffect(() => {
    fetchBikeDescriptions(state, modelYear);
  }, [state, modelYear]);

  const closeImagePopup = () => {
    setImagePopupOpen(false);
  };

  // Simulated API Call
  const handleSimulatedApiCall = async (values) => {
    try {
      const selectedBike = values.bikeDescription;
      if (!selectedBike || !selectedBike.IdMotoKey) {
        console.error("No bike selected or missing IdMotoKey");
        return;
      }
      const selectedState = state;
      
      const response = await fetch(
        `https://motocfapi2-470191599805.us-central1.run.app/?idmotokey=${selectedBike.IdMotoKey}&usermail=${user?.email}&ciudad=${state}`
      );
  
      if (response.ok) {
        const data = await response.json();
        setApiResponses(data);
      } else {
        console.error("Failed to fetch API responses:", response.statusText);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };


  const handleAdditionalFormSubmit = (values) => {
    const selectedInsuranceDetails = apiResponses.find(
      (response) => response.id === selectedResponse
    );
  
    const summary = {
      ...values, // Includes nombreAgenteVentas automatically
      nombreAgenteVentas: nombreAgenteVentas,
      name: user?.name || "Guest User",
      email: user?.email || "No email available",
      selectedInsurance: selectedResponse,
      insuranceDetails: selectedInsuranceDetails,
      descripcionMoto:
        values.bikeDescription?.NomSeleccion || "Descripción no disponible",
      timestamp: new Date().toISOString(),
    };
    console.log("Form Summary:", summary); // Debug the formSummary
    setFormSummary(summary);
    setModalOpen(true);
  };
  

  const closeModal = () => {
    setModalOpen(false);
  };

  const confirmSubmission = async () => {
    console.log("Final submission:", formSummary);
  
    // Convert formSummary into a WhatsApp-friendly message
    const whatsappMessage = `
      *Confirmación de Información:*
      Id de sistema: 
      *Información de la Moto:*
      Descripción: ${formSummary.insuranceDetails.descripcionMoto || "No disponible"}
      Año: ${formSummary.insuranceDetails.anioModelo}
      Placas: ${formSummary.placas || "No disponible"}
      Número de Serie: ${formSummary.numeroSerie || "No disponible"}
      Número de Motor: ${formSummary.numeroMotor || "No disponible"}
     
      
      *Información del Titular:*
      Nombre: ${formSummary.nombreTitular || "No disponible"}
      Teléfono: ${formSummary.telefonoTitular || "No disponible"}
      Email: ${formSummary.emailTitular || "No disponible"}
      RFC: ${formSummary.rfc || "No disponible"}
      Dirección: ${formSummary.calleNumero || "No disponible"}
      Código Postal: ${formSummary.codigoPostal || "No disponible"}
      Colonia: ${formSummary.colonia || "No disponible"}
      Método de pago: ${formSummary.MetodoPago || "No disponible"}
      Detalle de Método de pago: ${formSummary.DetMetodoPago || "No disponible"}
      
      *Información del Agente de Ventas:*
      Sucursal: ${formSummary.name || "No disponible"}
      email sucursal: ${formSummary.email || "No disponible"}
      Nombre: ${formSummary.nombreAgenteVentas || "No disponible"}
      
      *Detalles de Aseguradora:*
      Aseguradora: ${formSummary.insuranceDetails.nombreAseguradora || "No hay aseguradora"}
      Llave Externa (Aseguradora) : ${formSummary.insuranceDetails.llaveExterna || "No Existe llave externa"}
      Suma Asegurada: ${new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(formSummary.insuranceDetails.sumaAsegurada || 0)}
      Costo de Poliza: ${new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(formSummary.insuranceDetails.costoPoliza || 0)}
      Cobertura: ${formSummary.insuranceDetails.tipoCobertura || "No disponible"}
    `;
    try {
      const response = await fetch("https://save-records-motocf-470191599805.us-central1.run.app/saveToDatabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formSummary),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
      }
  
      console.log("Data successfully saved to the database.");
    } catch (error) {
      console.error("Error saving data to the database:", error);
      alert("An error occurred while saving data. Please try again.");
      return;
    } 
    // Encode the message for use in a URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappLink = `https://wa.me/5218112650124?text=${encodedMessage}`;

   // Detect mobile or tablet
  const isMobileOrTablet = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );

  if (isMobileOrTablet) {
    // Use window.open for mobile and tablet
    window.location.href = whatsappLink;
  } else {
    // Use window.location.href for desktop
    window.open(whatsappLink, "_blank");
   
  };

  setModalOpen(false);
  setSnackbarOpen(true);
  
    //Optional: Simulate user sign-out after submission
   setTimeout(() => {
     setUser(null);
  }, 3000);
  };
  
  const paymentOptions = {
    Efectivo: ["Transferencia", "Deposito"],
    "Tarjeta de Credito": ["Contado", "3 Meses sin intereses", "6 Meses sin intereses"],
  };
  

    
  

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box m="10px">
      <Header
        title="Formulario de Selección de Moto"
        subtitle="Completa los campos con la información solicitada"
      />
        {/* Image Popup */}
              <Modal open={imagePopupOpen} onClose={closeImagePopup}>
                <Box
                  p="20px"
                  borderRadius="10px"
                  bgcolor="white"
                  m="20px auto"
                  maxWidth="700px"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight="bold" textAlign="center">
                    ¡Bienvenido!
                  </Typography>
                  <img
                    src="/informacionTDC.jpeg" // Replace with actual image URL
                    alt="Informative"
                    style={{ width: "100%", borderRadius: "10px", marginTop: "10px" }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={closeImagePopup}
                    sx={{ marginTop: "20px" }}
                  >
                    Continuar
                  </Button>
                </Box>
              </Modal>

      {/* First Form */}
      <Formik
        onSubmit={(values) => {
          setNombreAgenteVentas(values.nombreAgenteVentas); 
          handleSimulatedApiCall(values);
        }}
        initialValues={{
          state: "",
          modelYear: "",
          bikeDescription: "",
          nombreAgenteVentas: ""
        }}
        validationSchema={yup.object().shape({
          state: yup.string().required("Selecciona el estado"),
          modelYear: yup.string().required("Selecciona el modelo"),
          bikeDescription: yup
            .object()
            .required("Selecciona una descripción")
            .nullable(), // Ensure it can handle null initial state
            nombreAgenteVentas: yup
            .string()
            .required("El nombre del agente de ventas es requerido"),
        })}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="10px"
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
                    <MenuItem value="CIUDAD DE MEXICO">CIUDAD DE MEXICO</MenuItem>
                    <MenuItem value="AGUASCALIENTES">AGUASCALIENTES</MenuItem>
                    <MenuItem value="BAJA CALIFORNIA NORTE">BAJA CALIFORNIA NORTE</MenuItem>
                    <MenuItem value="BAJA CALIFORNIA SUR">BAJA CALIFORNIA SUR</MenuItem>
                    <MenuItem value="CAMPECHE">CAMPECHE</MenuItem>
                    <MenuItem value="COAHUILA">COAHUILA</MenuItem>
                    <MenuItem value="COLIMA">COLIMA</MenuItem>
                    <MenuItem value="CHIAPAS">CHIAPAS</MenuItem>
                    <MenuItem value="CHIHUAHUA">CHIHUAHUA</MenuItem>
                    <MenuItem value="DURANGO">DURANGO</MenuItem>
                    <MenuItem value="GUANAJUATO">GUANAJUATO</MenuItem>
                    <MenuItem value="GUERRERO">GUERRERO</MenuItem>
                    <MenuItem value="HIDALGO">HIDALGO</MenuItem>
                    <MenuItem value="JALISCO">JALISCO</MenuItem>
                    <MenuItem value="ESTADO DE MEXICO">ESTADO DE MEXICO</MenuItem>
                    <MenuItem value="MICHOACAN">MICHOACAN</MenuItem>
                    <MenuItem value="MORELOS">MORELOS</MenuItem>
                    <MenuItem value="NAYARIT">NAYARIT</MenuItem>
                    <MenuItem value="NUEVO LEON">NUEVO LEON</MenuItem>
                    <MenuItem value="OAXACA">OAXACA</MenuItem>
                    <MenuItem value="PUEBLA">PUEBLA</MenuItem>
                    <MenuItem value="QUERETARO">QUERETARO</MenuItem>
                    <MenuItem value="QUINTANA ROO">QUINTANA ROO</MenuItem>
                    <MenuItem value="SAN LUIS POTOSI">SAN LUIS POTOSI</MenuItem>
                    <MenuItem value="SINALOA">SINALOA</MenuItem>
                    <MenuItem value="SONORA">SONORA</MenuItem>
                    <MenuItem value="TABASCO">TABASCO</MenuItem>
                    <MenuItem value="TAMAULIPAS">TAMAULIPAS</MenuItem>
                    <MenuItem value="TLAXCALA">TLAXCALA</MenuItem>
                    <MenuItem value="VERACRUZ">VERACRUZ</MenuItem>
                    <MenuItem value="YUCATAN">YUCATAN</MenuItem>
                    <MenuItem value="ZACATECAS">ZACATECAS</MenuItem>
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
                  <MenuItem value="2026">2026</MenuItem>
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
                >
                  <MenuItem disabled value="">
                    <em>
                      {loadingDescriptions
                        ? "Cargando opciones..."
                        : "Descripción de la Moto"}
                    </em>
                  </MenuItem>
                  {!loadingDescriptions &&
                    bikeDescriptions.map((desc) => (
                      <MenuItem
                        key={desc.IdMotoKey}
                        value={desc} // Store the entire object
                      >
                        {desc.NomSeleccion} {/* Display NomSeleccion */}
                      </MenuItem>
                    ))}
                </Select>
                <TextField
                    label="Nombre del Agente de Ventas"
                    name="nombreAgenteVentas"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.nombreAgenteVentas}
                    error={touched.nombreAgenteVentas && Boolean(errors.nombreAgenteVentas)}
                    helperText={touched.nombreAgenteVentas && errors.nombreAgenteVentas}
                    fullWidth
                    sx={{ gridColumn: "span 4" }}
                  />
                

              </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Cotizar
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* API Responses */}
    {/* API Responses */}
<Box
  mt="10px"
  display="flex"
  gap="10px"
  flexWrap="wrap"
  justifyContent="center"
>
  {apiResponses.length > 0 ? (
    apiResponses.map((response) => (
      <Card
        key={response.id}
        sx={{
          border: selectedResponse === response.id ? "2px solid #4caf50" : "1px solid #ccc",
          borderRadius: "10px",
          width: "500px",
          cursor: "pointer",
        }}
        onClick={() => setSelectedResponse(response.id)}
      >
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr",
            gap: "20px",
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src={response.logo} alt="Company Logo" style={{ width: "150px" }} />
            <Typography variant="h4" fontWeight="bold" mt="14px">
              Costo:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MXN",
              }).format(response.costoPoliza)}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box>
            <Typography>Cobertura: {response.tipoCobertura}</Typography>
            <Typography>
              Suma:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MXN",
              }).format(response.sumaAsegurada)}
            </Typography>
            <Typography>Moto Seleccionada: {response.descripcionMoto}</Typography>
            <Typography>
            Deducible Daños Materiales: {response.danosMateriales ? `${parseFloat(response.danosMateriales).toFixed(2)}%` : "N/A"}
          </Typography>

            <Typography>
              Deducible Robo: {response.roboTotal ? `${parseFloat(response.roboTotal).toFixed(2)}%` : "N/A"}
            </Typography>

            <Typography>
              Resp. Civil: {" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MXN",
              }).format(response.responsabilidadCivil)} </Typography>
            
            <Typography>
              Gastos Médicos: {" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MXN",
              }).format(response.gastosMedicos)}
            </Typography>
            <Typography>Legales: {response.gastosLegales}</Typography>
            <Typography>Asistencia: {response.asistenciaVial}</Typography>
          </Box>
        </CardContent>
      </Card>
    ))
  ) : (
    <Typography variant="h6" color="textSecondary" textAlign="center">
      No hay cotizaciones disponibles.
    </Typography>
  )}
</Box>



      {/* Second Form */}
      {selectedResponse && (
         <Formik
         onSubmit={handleAdditionalFormSubmit}
         initialValues={{
           placas: "",
           numeroSerie: "",
           numeroMotor: "",
           nombreTitular: "",
           telefonoTitular: "",
           emailTitular: "",
           rfc: "",
           codigoPostal: "",
           calleNumero: "",
           colonia: "",
           MetodoPago: "",
           DetMetodoPago: "",
         }}
         validationSchema={yup.object().shape({
           placas: yup.string(),
           numeroSerie: yup.string().required("Campo requerido"),
           numeroMotor: yup.string().required("Campo requerido"),
           nombreTitular: yup.string().required("Campo requerido"),
           rfc: yup.string().required("Campo requerido"),
           codigoPostal: yup.string().required("Campo requerido"),
           calleNumero: yup.string().required("Campo requerido"),
           colonia: yup.string().required("Campo requerido"),
           telefonoTitular: yup
             .string()
             .required("Campo requerido")
             .matches(/^[0-9]+$/, "El teléfono debe contener sólo números"),
           emailTitular: yup.string().required("Campo requerido").email("Ingresa un correo electrónico válido"),
           MetodoPago: yup.string().required("Selecciona un método de pago"),
           DetMetodoPago: yup.string().required("Selecciona un detalle del método de pago"),
         })}
       >
         {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
           <form onSubmit={handleSubmit}>
             <Box display="grid" gap="10px" gridTemplateColumns="repeat(2, 1fr)" mt="10px">
               <TextField
                 label="Placas"
                 name="placas"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.placas}
                 error={touched.placas && Boolean(errors.placas)}
                 helperText={touched.placas && errors.placas}
                 fullWidth
               />
               <TextField
                  label="Número de Serie"
                  name="numeroSerie"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.numeroSerie}
                  error={touched.numeroSerie && Boolean(errors.numeroSerie)}
                  helperText={touched.numeroSerie && errors.numeroSerie}
                  fullWidth
                />
               <TextField
                 label="Número de Motor"
                 name="numeroMotor"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.numeroMotor}
                 error={touched.numeroMotor && Boolean(errors.numeroMotor)}
                 helperText={touched.numeroMotor && errors.numeroMotor}
                 fullWidth
               />
               <TextField
                 label="Nombre Contratante"
                 name="nombreTitular"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.nombreTitular}
                 error={touched.nombreTitular && Boolean(errors.nombreTitular)}
                 helperText={touched.nombreTitular && errors.nombreTitular}
                 fullWidth
               />
               <TextField
                 label="Teléfono de Titular"
                 name="telefonoTitular"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.telefonoTitular}
                 error={touched.telefonoTitular && Boolean(errors.telefonoTitular)}
                 helperText={touched.telefonoTitular && errors.telefonoTitular}
                 fullWidth
               />
               <TextField
                 label="Email de Titular"
                 name="emailTitular"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.emailTitular}
                 error={touched.emailTitular && Boolean(errors.emailTitular)}
                 helperText={touched.emailTitular && errors.emailTitular}
                 fullWidth
               />
               <TextField
                 label="RFC"
                 name="rfc"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.rfc}
                 error={touched.rfc && Boolean(errors.rfc)}
                 helperText={touched.rfc && errors.rfc}
                 fullWidth
               />
               <TextField
                 label="Código Postal"
                 name="codigoPostal"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.codigoPostal}
                 error={touched.codigoPostal && Boolean(errors.codigoPostal)}
                 helperText={touched.codigoPostal && errors.codigoPostal}
                 fullWidth
               />
               <TextField
                 label="Calle y Número"
                 name="calleNumero"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.calleNumero}
                 error={touched.calleNumero && Boolean(errors.calleNumero)}
                 helperText={touched.calleNumero && errors.calleNumero}
                 fullWidth
               />
               <TextField
                 label="Colonia"
                 name="colonia"
                 onBlur={handleBlur}
                 onChange={handleChange}
                 value={values.colonia}
                 error={touched.colonia && Boolean(errors.colonia)}
                 helperText={touched.colonia && errors.colonia}
                 fullWidth
               />
               
               {/* Método de Pago */}
               <FormControl fullWidth>
                 <InputLabel>Metodo de Pago</InputLabel>
                 <Select
                   name="MetodoPago"
                   value={values.MetodoPago}
                   onChange={(e) => {
                     const selectedMethod = e.target.value;
                     setFieldValue("MetodoPago", selectedMethod);
                     setFieldValue("DetMetodoPago", ""); // Reset DetMetodoPago
                     setDetMetodoPagoOptions(paymentOptions[selectedMethod] || []);
                   }}
                   onBlur={handleBlur}
                   error={touched.MetodoPago && Boolean(errors.MetodoPago)}
                 >
                   <MenuItem value="Efectivo">Efectivo</MenuItem>
                   <MenuItem value="Tarjeta de Credito">Tarjeta de Crédito</MenuItem>
                 </Select>
               </FormControl>
 
               {/* Detalle del Método de Pago (Condicional) */}
               {values.MetodoPago && (
                 <FormControl fullWidth>
                   <InputLabel>Detalle Método de Pago</InputLabel>
                   <Select
                     name="DetMetodoPago"
                     value={values.DetMetodoPago}
                     onChange={handleChange}
                     onBlur={handleBlur}
                     error={touched.DetMetodoPago && Boolean(errors.DetMetodoPago)}
                   >
                     {detMetodoPagoOptions.map((option) => (
                       <MenuItem key={option} value={option}>
                         {option}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               )}
             </Box>
 
             <Box display="flex" justifyContent="end" mt="20px">
               <Button type="submit" color="secondary" variant="contained">
                 Registrar
               </Button>
             </Box>
           </form>
         )}
       </Formik>
      )}

<Modal open={modalOpen} onClose={closeModal}>
  <Box
    p="10px"
    borderRadius="10px"
    bgcolor="white"
    m="0"
    width="100vw"
    height="100vh"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap="20px"
  
  >
    <Typography variant="h5" fontWeight="bold" textAlign="center">
      Confirmar Información
    </Typography>
    {formSummary && (
      <>
        {/* Moto Info Group */}
        <Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Información de la Moto
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="10px">
            <Box>
              <strong>Descripción de la Moto:</strong>{" "}
              {formSummary.insuranceDetails.descripcionMoto || "No disponible"}
            </Box>
            <Box>
              <strong>Placas:</strong> {formSummary.placas || "No disponible"}
            </Box>
            <Box>
              <strong>Número de Serie:</strong>{" "}
              {formSummary.numeroSerie || "No disponible"}
            </Box>
            <Box>
              <strong>Número de Motor:</strong>{" "}
              {formSummary.numeroMotor || "No disponible"}
            </Box>
            
          </Box>
        </Box>

        {/* Titular Info Group */}
        <Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Información del Titular
          </Typography>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="10px">
            <Box>
              <strong>Nombre del Titular:</strong>{" "}
              {formSummary.nombreTitular || "No disponible"}
            </Box>
            <Box>
              <strong>Teléfono del Titular:</strong>{" "}
              {formSummary.telefonoTitular || "No disponible"}
            </Box>
            <Box>
              <strong>Email del Titular:</strong>{" "}
              {formSummary.emailTitular || "No disponible"}
            </Box>
            <Box>
              <strong>RFC:</strong> {formSummary.rfc || "No disponible"}
            </Box>
            <Box>
              <strong>Dirección:</strong> {formSummary.calleNumero || "No disponible"}
            </Box>
            <Box>
              <strong>Código Postal:</strong>{" "}
              {formSummary.codigoPostal || "No disponible"}
            </Box>
            <Box>
              <strong>Colonia:</strong> {formSummary.colonia || "No disponible"}
            </Box>
            <Box>
              <strong>Método de pago:</strong> {formSummary.MetodoPago || "No disponible"}
            </Box>
            <Box>
              <strong>Detalle método de pago:</strong> {formSummary.DetMetodoPago || "No disponible"}
            </Box>
          </Box>
        </Box>

        {/* Agente de Ventas Group */}
        <Box>
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Información del Agente de Ventas
          </Typography>
          <Box>
            <strong>Nombre del Agente de Ventas:</strong>{" "}
            {formSummary.nombreAgenteVentas || "No disponible"}
          </Box>
        </Box>

        {/* Insurance Details Group */}
        {formSummary.insuranceDetails && (
          <Box>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              Detalles de Aseguradora
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="10px" alignItems="center">
              <Box gridColumn="span 2" textAlign="right">
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  Costo de Poliza:{" "}
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(formSummary.insuranceDetails.costoPoliza || 0)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <img
                  src={formSummary.insuranceDetails.logo}
                  alt="Logo Aseguradora"
                  style={{ width: "100px", display: "block" }}
                />
              </Box>
            </Box>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="10px">
              {Object.entries(formSummary.insuranceDetails).map(([key, value]) => {
                if (["logo", "id", "selectedInsurance", "timestamp", "costoPoliza"].includes(key)) return null; // Exclude these fields
                return (
                  <Box key={key}>
                    <strong>
                      {key
                        .replace(/([A-Z])/g, " $1") // Split camelCase
                        .replace(/^./, (str) => str.toUpperCase())}:
                    </strong>{" "}
                    {value || "No disponible"}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </>
    )}
    <Box display="flex" justifyContent="space-between">
      <Button variant="outlined" onClick={closeModal}>
        Editar
      </Button>
      <Button variant="contained" color="secondary" onClick={confirmSubmission}>
        Confirmar
      </Button>
    </Box>
  </Box>
</Modal>





      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity="success" sx={{ width: "100%" }}>
          Seguro solicitado, recibirás actualizaciones al correo capturado.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Form;