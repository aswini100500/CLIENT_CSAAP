
import useSWR from 'swr'
import { getBrokers } from '../api/brokers'

export const useBrokers = () =>
  useSWR('brokers', getBrokers)
