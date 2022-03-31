import React from 'react'

import { useForm, SubmitHandler } from 'react-hook-form'
import vacanciesFetcher from './functions/fetchVacancies'
import composeUrl from '../../utils/composeUrl'

import { Vacancy } from '../../components'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'

import SearchIcon from '@mui/icons-material/Search'

import { Vacancy as IVacancy } from '../../app/slices/company/interfaces'
import { Inputs } from './interfaces'

const breakpoints = {
  xs: 12,
  sm: 6,
  md: 3
}

const Vacancies: React.FC = () => {
  const [error, setError] = React.useState('')
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [vacancies, setVacancies] = React.useState<IVacancy[]>([])
  const { register, handleSubmit } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async data => {
    try {
      setIsLoaded(false)
      const url = composeUrl(data, 'https://yourjob-api.herokuapp.com/vacancies')
      const vacancies = await vacanciesFetcher.filter(url)
      setVacancies(vacancies)
    } catch (err) {
      err instanceof Error ? setError(err.message) : setError('Unable to search vacancies!')
    } finally {
      setIsLoaded(true)
    }
  }

  React.useEffect(() => {
    ;(async () => {
      try {
        setIsLoaded(false)
        const vacancies = await vacanciesFetcher.list()
        setVacancies(vacancies)
      } catch (err) {
        err instanceof Error ? setError(err.message) : setError('Unable to load list of vacancies!')
      } finally {
        setIsLoaded(true)
      }
    })()
  }, [])

  return (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Stack
          sx={{ width: '95%' }}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField label="Region" fullWidth {...register('region')} variant="outlined" />
          <TextField label="Category" fullWidth {...register('category')} variant="outlined" />
          <TextField label="Position" fullWidth {...register('position')} variant="outlined" />
          <TextField
            label="Salary"
            fullWidth
            {...register('salary')}
            placeholder="minVal/maxVal"
            variant="outlined"
            helperText="1000/1500"
          />
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            <IconButton edge="end" type="submit">
              <SearchIcon />
            </IconButton>
          </Box>
        </Stack>
      </Grid>
      {!isLoaded ? (
        <Grid item sx={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress color="secondary" />
        </Grid>
      ) : error ? (
        <Grid item sx={{ width: '100%', p: 10 }}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      ) : (
        vacancies.map(vacancy => (
          <Vacancy key={vacancy.id} vacancy={vacancy} company={vacancy['company:vacancies']} breakpoints={breakpoints} />
        ))
      )}
    </Grid>
  )
}

export default Vacancies
