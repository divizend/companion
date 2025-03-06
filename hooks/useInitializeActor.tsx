import { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { useUserProfile } from '@/common/profile';
import { ActorService } from '@/services/actor.service';
import SocketHandler from '@/socket/socket-handler';

import { initializeActor, loadDepot, setActorLoadingState } from '../signals/actions/actor.actions';
import { LoadingState } from '../signals/actor';
import { actor } from '../signals/actor';
import usePortfolioQuery from './actor/useDepotQuery';

const formatPerformanceStats = (performanceStats: any) => {
  return {
    loadingDepots: `${performanceStats.loadingDepots / 1000}s`,
    initializingActor: `${performanceStats.initializingActor / 1000}s`,
    loadingWidgets: `${performanceStats.loadingWidgets / 1000}s`,
    total: `${performanceStats.total / 1000}s`,
    startingTime: dayjs(performanceStats.startingTime).format('MM/DD/YYYY HH:mm:ss,SSS'),
  };
};

export default function useInitializeActor() {
  const depotIds = actor.value.depotIds;
  const currency = useUserProfile().profile?.flags.currency;
  const depot = actor.value.depot;
  const loadingState = actor.value.loadingState;
  const [performanceStats, setPerformanceStats] = useState({
    startingTime: new Date(),
    loadingDepots: 0,
    initializingActor: 0,
    loadingWidgets: 0,
    total: 0,
  });
  const performanceState = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });

  useEffect(() => {
    return () => {
      const total = new Date().getTime() - performanceStats.startingTime.getTime();
      if (!performanceStats.loadingWidgets && total > 2000) {
        console.log({
          message: 'Actor exited before loading complete',
          level: 'warning',
          extra: {
            depotIds: depotIds,
            currency: currency,
            ...formatPerformanceStats(performanceStats),
            waitingTime: `${total / 1000}s`,
          },
        });
      }
    };
  }, []);

  useEffect(() => {
    if (loadingState !== LoadingState.AWAITING) return;
    setActorLoadingState(LoadingState.AGGREGATING);
    setPerformanceStats({
      startingTime: new Date(),
      loadingDepots: 0,
      initializingActor: 0,
      loadingWidgets: 0,
      total: 0,
    });
    SocketHandler.connect();
    console.log('Actor initialized');
    const controller = new AbortController();
    loadDepot(depotIds === 'all' ? undefined : depotIds, controller.signal);
    return () => controller.abort();
  }, [depotIds]);

  useEffect(() => {
    if (!depot || loadingState !== LoadingState.AGGREGATING) return;
    setPerformanceStats(oldStats => ({
      ...oldStats,
      loadingDepots: new Date().getTime() - oldStats.startingTime.getTime(),
    }));
    setActorLoadingState(LoadingState.INITIALIZING);
    initializeActor({ ...depot, currency: currency }).then(() => {
      setActorLoadingState(LoadingState.LOADING_WIDGETS);
      setPerformanceStats(oldStats => ({
        ...oldStats,
        initializingActor: new Date().getTime() - oldStats.startingTime.getTime() - oldStats.loadingDepots,
      }));
    });
  }, [depot]);

  useEffect(() => {
    if (!performanceState.data || !depot) return;
    setPerformanceStats(oldStats => ({
      ...oldStats,
      loadingWidgets:
        new Date().getTime() - oldStats.startingTime.getTime() - oldStats.loadingDepots - oldStats.initializingActor,
      total: new Date().getTime() - oldStats.startingTime.getTime(),
    }));
    setActorLoadingState(LoadingState.READY);
  }, [performanceState?.isLoading]);

  useEffect(() => {
    if (!performanceStats.loadingWidgets || performanceStats.total < 2000) return;

    const meta = {
      message: 'Actor Loaded Successfully',
      level: 'info',
      extra: {
        depotIds,
        currency,
        ...formatPerformanceStats(performanceStats),
      },
    };
    console.log(meta);
    console.info('Actor Loaded Successfully', meta);
  }, [performanceStats]);
}
