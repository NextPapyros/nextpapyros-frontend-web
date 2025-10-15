const headerDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDateForHeader = (date: Date): string =>
  headerDateFormatter.format(date).replace(/^./, (c) => c.toUpperCase());
