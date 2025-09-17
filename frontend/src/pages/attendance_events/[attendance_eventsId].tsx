import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js'
import Head from 'next/head'
import React, { ReactElement, useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

import CardBox from '../../components/CardBox'
import LayoutAuthenticated from '../../layouts/Authenticated'
import SectionMain from '../../components/SectionMain'
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton'
import { getPageTitle } from '../../config'

import { Field, Form, Formik } from 'formik'
import FormField from '../../components/FormField'
import BaseDivider from '../../components/BaseDivider'
import BaseButtons from '../../components/BaseButtons'
import BaseButton from '../../components/BaseButton'
import FormCheckRadio from '../../components/FormCheckRadio'
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup'
import { SelectField } from "../../components/SelectField";
import { SelectFieldMany } from "../../components/SelectFieldMany";
import { SwitchField } from '../../components/SwitchField'
import {RichTextField} from "../../components/RichTextField";

import { update, fetch } from '../../stores/attendance_events/attendance_eventsSlice'
import { useAppDispatch, useAppSelector } from '../../stores/hooks'
import { useRouter } from 'next/router'

const EditAttendance_events = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const initVals = {

    student: null,

    timestamp: new Date(),

    status: '',

    method: '',

  }
  const [initialValues, setInitialValues] = useState(initVals)

  const { attendance_events } = useAppSelector((state) => state.attendance_events)

  const { attendance_eventsId } = router.query

  useEffect(() => {
    dispatch(fetch({ id: attendance_eventsId }))
  }, [attendance_eventsId])

  useEffect(() => {
    if (typeof attendance_events === 'object') {
      setInitialValues(attendance_events)
    }
  }, [attendance_events])

  useEffect(() => {
      if (typeof attendance_events === 'object') {

          const newInitialVal = {...initVals};

          Object.keys(initVals).forEach(el => newInitialVal[el] = (attendance_events)[el])

          setInitialValues(newInitialVal);
      }
  }, [attendance_events])

  const handleSubmit = async (data) => {
    await dispatch(update({ id: attendance_eventsId, data }))
    await router.push('/attendance_events/attendance_events-list')
  }

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit attendance_events')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiChartTimelineVariant} title={'Edit attendance_events'} main>
        {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>

    <FormField label='Student' labelFor='student'>
        <Field
            name='student'
            id='student'
            component={SelectField}
            options={initialValues.student}
            itemRef={'users'}

            showField={'firstName'}

        ></Field>
    </FormField>

      <FormField
          label="Timestamp"
      >
          <DatePicker
              dateFormat="yyyy-MM-dd hh:mm"
              showTimeSelect
              selected={initialValues.timestamp ?
                  new Date(
                      dayjs(initialValues.timestamp).format('YYYY-MM-DD hh:mm'),
                  ) : null
              }
              onChange={(date) => setInitialValues({...initialValues, 'timestamp': date})}
          />
      </FormField>

    <FormField label="Status" labelFor="status">
        <Field name="status" id="status" component="select">

            <option value="present">present</option>

            <option value="absent">absent</option>

            <option value="late">late</option>

        </Field>
    </FormField>

    <FormField label="Method" labelFor="method">
        <Field name="method" id="method" component="select">

            <option value="face_recognition">face_recognition</option>

            <option value="manual_override">manual_override</option>

        </Field>
    </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type="submit" color="info" label="Submit" />
                <BaseButton type="reset" color="info" outline label="Reset" />
                <BaseButton type='reset' color='danger' outline label='Cancel' onClick={() => router.push('/attendance_events/attendance_events-list')}/>
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  )
}

EditAttendance_events.getLayout = function getLayout(page: ReactElement) {
  return (
      <LayoutAuthenticated>
          {page}
      </LayoutAuthenticated>
  )
}

export default EditAttendance_events
