import React from 'react'

import useStyles from '../../../styles/global'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { updateData, resetData, Inputs } from '../../../app/slices/companyRegisterForm'
import { storage } from '../../../lib/firebase'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Link from '@mui/material/Link'
import CircularProgress from '@mui/material/CircularProgress'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { AuthForm, CompanyProfileForm } from '../../../components'

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'

interface IStep {
  label: string
  renderComponent: (handleNext: () => void) => React.ReactElement
}

const steps: IStep[] = [
  {
    label: 'Authentication',
    renderComponent: handleNext => {
      return <AuthForm handleNext={handleNext} updateData={updateData} />
    }
  },
  {
    label: 'Profile',
    renderComponent: handleNext => {
      return <CompanyProfileForm handleNext={handleNext} />
    }
  }
]

const CompanyRegister: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0)
  const [isLoaded, setIsLoaded] = React.useState(true)
  const [error, setError] = React.useState('')
  const classes = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const formData = useAppSelector(state => state.companyRegisterForm.data)

  const handleNext = () => setActiveStep(activeStep + 1)

  const handleBack = () => setActiveStep(activeStep - 1)

  const handleReset = () => {
    dispatch(resetData())

    setActiveStep(0)
  }

  const submitNewCompany = async () => {
    if (formData) {
      setIsLoaded(false)
      setError('')
      try {
        const formDataCopy: Partial<Inputs> = JSON.parse(JSON.stringify(formData))
        delete formDataCopy.confirmPassword
        if (formData.companyLogo) {
          const storageRef = storage.ref(storage.storage, `companies/${formDataCopy.email}/logo`)
          await storage.uploadBytesResumable(
            storageRef,
            JSON.parse(formDataCopy.companyLogo as string)
          )
          formDataCopy.companyLogo = await storage.getDownloadURL(storageRef)
        }
        const response = await fetch('https://yourjob-api.herokuapp.com/companies/register', {
          method: 'POST',
          body: JSON.stringify(formDataCopy),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          navigate('/last_step')
        } else {
          const body = await response.json()
          throw new Error(body.error)
        }
      } catch (err) {
        err instanceof Error ? setError(err.message) : setError('Something unexpected happened!')
      } finally {
        setIsLoaded(true)
      }
    }
  }

  if (!isLoaded) {
    return (
      <Container className={classes.container} sx={{ display: 'grid', placeItems: 'center' }}>
        <CircularProgress color="secondary" />
      </Container>
    )
  }
  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Box className={classes.formWrapper}>
          <Box sx={{ width: '100%' }}>
            <Typography
              variant="h3"
              component="div"
              sx={{ textAlign: 'center' }}
              color="secondary.dark"
            >
              Create new account
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <RouterLink to="/companies/login">
                <Link underline="always" component="button" variant="h6">
                  Login instead
                </Link>
              </RouterLink>
            </Box>
            <Stepper sx={{ mt: 2 }} activeStep={activeStep}>
              {steps.map(step => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box sx={{ textAlign: 'center', width: '100%', mt: 4, mb: 4 }}>
            {activeStep === steps.length
              ? (
              <>
                <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                  All steps completed - you&apos;re finished
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  type="button"
                  onClick={submitNewCompany}
                >
                  Submit
                </Button>
                {error && (
                  <Typography variant="body1" color="error" sx={{ mt: 2, mb: 1 }}>
                    {error}
                  </Typography>
                )}
              </>
                )
              : (
              <>{steps[activeStep].renderComponent(handleNext)}</>
                )}
          </Box>
          <Box className={classes.buttonsWrapper}>
            <Button
              className={classes.button}
              variant="contained"
              disabled={activeStep === 0 ? Boolean(1) : Boolean(0)}
              startIcon={<KeyboardArrowLeftIcon />}
              type="button"
              onClick={handleBack}
            >
              Previous
            </Button>
            <Button
              className={classes.button}
              color="error"
              variant="contained"
              onClick={handleReset}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default CompanyRegister
