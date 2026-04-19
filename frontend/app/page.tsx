'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type Scenario = 'success' | 'slow_request' | 'system_error';

type RunScenarioForm = {
  scenario: Scenario;
};

type ScenarioRun = {
  id: string;
  scenario: string;
  status: string;
  durationMs: number | null;
  message: string | null;
  createdAt: string;
};

const queryClient = new QueryClient();

function SignalLabPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const reactQueryClient = useQueryClient();

  const { register, handleSubmit, watch } = useForm<RunScenarioForm>({
    defaultValues: {
      scenario: 'success',
    },
  });

  const selectedScenario = watch('scenario');

  const historyQuery = useQuery<ScenarioRun[]>({
    queryKey: ['scenario-history'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/scenarios`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error('Не удалось загрузить историю запусков');
      }
      return res.json();
    },
    refetchInterval: 5000,
  });

  const runScenarioMutation = useMutation({
    mutationFn: async (payload: RunScenarioForm) => {
      const res = await fetch(`${apiUrl}/api/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Ошибка запуска сценария');
      }

      return data;
    },
    onSettled: async () => {
      await reactQueryClient.invalidateQueries({ queryKey: ['scenario-history'] });
    },
  });

  const onSubmit = (values: RunScenarioForm) => {
    runScenarioMutation.mutate(values);
  };

  const statusText = useMemo(() => {
    if (runScenarioMutation.isPending) return 'Сценарий выполняется...';
    if (runScenarioMutation.isSuccess) return 'Сценарий успешно выполнен';
    if (runScenarioMutation.isError) {
      return runScenarioMutation.error instanceof Error
        ? runScenarioMutation.error.message
        : 'Сценарий завершился с ошибкой';
    }
    return 'Готово';
  }, [
    runScenarioMutation.isPending,
    runScenarioMutation.isSuccess,
    runScenarioMutation.isError,
    runScenarioMutation.error,
  ]);

  const formatStatus = (status: string) => {
    if (status === 'success') return 'успешно';
    if (status === 'slow') return 'медленно';
    if (status === 'error') return 'ошибка';
    return status;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Signal Lab</h1>
          <p className="mt-2 text-slate-400">
            Демонстрационная система мониторинга сценариев, метрик, логов и ошибок.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-1">
            <h2 className="mb-4 text-xl font-semibold">Запуск сценария</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="scenario" className="mb-2 block text-sm text-slate-300">
                  Сценарий
                </label>
                <select
                  id="scenario"
                  {...register('scenario')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                >
                  <option value="success">success</option>
                  <option value="slow_request">slow_request</option>
                  <option value="system_error">system_error</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={runScenarioMutation.isPending}
                className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {runScenarioMutation.isPending
                  ? 'Выполнение...'
                  : `Запустить ${selectedScenario}`}
              </button>
            </form>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
              <div className="text-slate-400">Статус</div>
              <div className="mt-1 font-medium">{statusText}</div>
            </div>

            {runScenarioMutation.data && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
                <div className="text-slate-400">Последний ответ</div>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-slate-200">
                  {JSON.stringify(runScenarioMutation.data, null, 2)}
                </pre>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">История запусков</h2>
              <button
                onClick={() =>
                  reactQueryClient.invalidateQueries({ queryKey: ['scenario-history'] })
                }
                className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
              >
                Обновить
              </button>
            </div>

            {historyQuery.isLoading ? (
              <p className="text-slate-400">Загрузка истории...</p>
            ) : historyQuery.isError ? (
              <p className="text-red-400">Не удалось загрузить историю</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="px-3 py-2">Сценарий</th>
                      <th className="px-3 py-2">Статус</th>
                      <th className="px-3 py-2">Длительность</th>
                      <th className="px-3 py-2">Сообщение</th>
                      <th className="px-3 py-2">Создано</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.data?.map((row) => (
                      <tr key={row.id} className="border-b border-slate-900">
                        <td className="px-3 py-2">{row.scenario}</td>
                        <td className="px-3 py-2">
                          <span
                            className={[
                              'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                              row.status === 'success'
                                ? 'bg-emerald-900 text-emerald-300'
                                : row.status === 'slow'
                                ? 'bg-amber-900 text-amber-300'
                                : 'bg-red-900 text-red-300',
                            ].join(' ')}
                          >
                            {formatStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2">{row.durationMs ?? '-'} мс</td>
                        <td className="px-3 py-2">{row.message ?? '-'}</td>
                        <td className="px-3 py-2">
                          {new Date(row.createdAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-xl font-semibold">Инструменты мониторинга</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <a
              href="http://localhost:3001/health"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-800"
            >
              <div className="font-medium">Состояние API</div>
              <div className="mt-1 text-sm text-slate-400">
                Проверка доступности backend
              </div>
            </a>

            <a
              href="http://localhost:3001/metrics"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-800"
            >
              <div className="font-medium">Метрики</div>
              <div className="mt-1 text-sm text-slate-400">
                Prometheus endpoint со всеми метриками
              </div>
            </a>

            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-800"
            >
              <div className="font-medium">Grafana</div>
              <div className="mt-1 text-sm text-slate-400">
                Дашборды и Explore для логов
              </div>
            </a>

            <a
              href="http://localhost:9090"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:bg-slate-800"
            >
              <div className="font-medium">Prometheus</div>
              <div className="mt-1 text-sm text-slate-400">
                Проверка scrape targets и запросов
              </div>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <SignalLabPage />
    </QueryClientProvider>
  );
}