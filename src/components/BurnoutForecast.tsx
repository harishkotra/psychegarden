type BurnoutForecastProps = {
  message: string;
};

export function BurnoutForecast({ message }: BurnoutForecastProps) {
  return (
    <section className="card forecast-card">
      <h2>Burnout Forecast</h2>
      <p>{message}</p>
    </section>
  );
}
