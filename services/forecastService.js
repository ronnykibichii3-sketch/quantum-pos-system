const prisma = require('../prismaClient');

function toNumber(value) {
  return Number(Number(value).toFixed(2));
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildSeries(receipts, productId) {
  const map = new Map();

  for (const receipt of receipts) {
    const key = dayKey(receipt.issuedAt);
    const current = map.get(key) || { units: 0, revenue: 0, count: 0 };
    let units = 0;
    let revenue = Number(receipt.total || 0);

    if (productId) {
      const item = receipt.cart.items.find((cartItem) => cartItem.productId === Number(productId));
      if (!item) {
        continue;
      }
      units = item.qty;
      revenue = Number(item.totalPrice || item.unitPrice * item.qty || 0);
    } else {
      units = receipt.cart.items.reduce((sum, item) => sum + item.qty, 0);
    }

    current.units += units;
    current.revenue += revenue;
    current.count += 1;
    map.set(key, current);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, ...value }));
}

function movingAverage(values, windowSize) {
  if (!values.length) {
    return 0;
  }

  const slice = values.slice(Math.max(0, values.length - windowSize));
  return slice.reduce((sum, value) => sum + value, 0) / slice.length;
}

function trendFactor(values) {
  if (values.length < 2) {
    return 1;
  }

  const recent = values.slice(-7);
  const previous = values.slice(-14, -7);
  const recentAvg = movingAverage(recent, recent.length);
  const previousAvg = previous.length ? movingAverage(previous, previous.length) : recentAvg;

  if (previousAvg === 0) {
    return 1;
  }

  return Math.max(0.5, Math.min(1.5, recentAvg / previousAvg));
}

function median(values) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function buildWarnings({ series, unitSeries, revenueSeries, syncEvents, horizonDays }) {
  const warnings = [];
  const recentUnits = unitSeries.slice(-7);
  const previousUnits = unitSeries.slice(-14, -7);
  const recentRevenue = revenueSeries.slice(-7);
  const previousRevenue = revenueSeries.slice(-14, -7);
  const recentAvgUnits = movingAverage(recentUnits, recentUnits.length || 1);
  const previousAvgUnits = previousUnits.length ? movingAverage(previousUnits, previousUnits.length) : recentAvgUnits;
  const recentAvgRevenue = movingAverage(recentRevenue, recentRevenue.length || 1);
  const previousAvgRevenue = previousRevenue.length ? movingAverage(previousRevenue, previousRevenue.length) : recentAvgRevenue;
  const unitMedian = median(unitSeries);
  const revenueMedian = median(revenueSeries);
  const pendingSyncs = syncEvents.filter((event) => event.status !== 'synced');
  const failedAttempts = pendingSyncs.reduce((sum, event) => sum + Number(event.attempts || 0), 0);
  const suspiciousDeviceCount = new Set(pendingSyncs.map((event) => event.deviceId)).size;

  if (series.length < 7) {
    warnings.push({
      type: 'data_scarcity',
      severity: 'medium',
      message: 'Forecast confidence is limited because there is not enough sales history yet.',
      evidence: { daysWithSales: series.length }
    });
  }

  if (previousAvgUnits > 0 && recentAvgUnits > previousAvgUnits * 1.75) {
    warnings.push({
      type: 'sales_spike',
      severity: 'high',
      message: 'Recent sales are much higher than the previous window. This may be a promo surge, bad data, or suspicious activity.',
      evidence: {
        recentAvgUnits: toNumber(recentAvgUnits),
        previousAvgUnits: toNumber(previousAvgUnits),
        jumpRatio: toNumber(recentAvgUnits / previousAvgUnits)
      }
    });
  }

  if (previousAvgRevenue > 0 && recentAvgRevenue > previousAvgRevenue * 1.75) {
    warnings.push({
      type: 'revenue_spike',
      severity: 'high',
      message: 'Revenue jumped sharply versus the prior period, which can indicate a real surge or anomalous data.',
      evidence: {
        recentAvgRevenue: toNumber(recentAvgRevenue),
        previousAvgRevenue: toNumber(previousAvgRevenue),
        jumpRatio: toNumber(recentAvgRevenue / previousAvgRevenue)
      }
    });
  }

  if (previousAvgUnits > 0 && recentAvgUnits < previousAvgUnits * 0.4) {
    warnings.push({
      type: 'sales_drop',
      severity: 'high',
      message: 'Sales fell sharply versus the prior period. This can point to stock issues, service disruption, or tampering.',
      evidence: {
        recentAvgUnits: toNumber(recentAvgUnits),
        previousAvgUnits: toNumber(previousAvgUnits),
        dropRatio: toNumber(recentAvgUnits / previousAvgUnits)
      }
    });
  }

  if (unitMedian > 0 && recentAvgUnits > unitMedian * 3) {
    warnings.push({
      type: 'outlier_pattern',
      severity: 'medium',
      message: 'Recent units are far above the typical median. Treat this forecast as a possible anomaly until verified.',
      evidence: {
        medianUnits: toNumber(unitMedian),
        recentAvgUnits: toNumber(recentAvgUnits)
      }
    });
  }

  if (revenueMedian > 0 && recentAvgRevenue > revenueMedian * 3) {
    warnings.push({
      type: 'outlier_revenue',
      severity: 'medium',
      message: 'Recent revenue is far above the typical median. This may require review for fraud, duplication, or unusual activity.',
      evidence: {
        medianRevenue: toNumber(revenueMedian),
        recentAvgRevenue: toNumber(recentAvgRevenue)
      }
    });
  }

  if (failedAttempts >= 3) {
    warnings.push({
      type: 'sync_risk',
      severity: 'high',
      message: 'There are repeated offline sync failures, which can indicate a compromised device, bad client state, or network abuse.',
      evidence: {
        pendingSyncs: pendingSyncs.length,
        failedAttempts,
        suspiciousDeviceCount
      }
    });
  }

  if (suspiciousDeviceCount >= 5) {
    warnings.push({
      type: 'device_anomaly',
      severity: 'medium',
      message: 'Multiple devices are showing unresolved sync activity. Review them for unauthorized access or tampering.',
      evidence: {
        suspiciousDeviceCount,
        pendingSyncs: pendingSyncs.length
      }
    });
  }

  if (horizonDays > 14) {
    warnings.push({
      type: 'long_horizon',
      severity: 'low',
      message: 'Long-range forecasts are less reliable and should not be used as security evidence.',
      evidence: { horizonDays }
    });
  }

  return warnings;
}

exports.generateForecast = async (data) => {
  const storeId = Number(data.storeId);
  const productId = data.productId ? Number(data.productId) : null;
  const horizonDays = Math.max(1, Number(data.horizonDays || 7));

  const receipts = await prisma.receipt.findMany({
    where: {
      storeId,
      issuedAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { issuedAt: 'asc' },
    include: {
      cart: {
        include: {
          items: true
        }
      }
    }
  });

  const series = buildSeries(receipts, productId);
  const unitSeries = series.map((entry) => entry.units);
  const revenueSeries = series.map((entry) => entry.revenue);
  const syncEvents = await prisma.offlineSyncEvent.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' }
  });

  const shortWindowUnits = movingAverage(unitSeries, 7);
  const longWindowUnits = movingAverage(unitSeries, 30);
  const shortWindowRevenue = movingAverage(revenueSeries, 7);
  const longWindowRevenue = movingAverage(revenueSeries, 30);
  const unitsTrend = trendFactor(unitSeries);
  const revenueTrend = trendFactor(revenueSeries);
  const confidenceBase = Math.min(0.95, Math.max(0.35, 1 - Math.abs(shortWindowUnits - longWindowUnits) / (Math.max(longWindowUnits, 1) * 2)));

  const forecastDate = new Date();
  forecastDate.setHours(0, 0, 0, 0);
  forecastDate.setDate(forecastDate.getDate() + horizonDays);

  const predictedUnits = toNumber(Math.max(0, shortWindowUnits * unitsTrend));
  const predictedRevenue = toNumber(Math.max(0, shortWindowRevenue * revenueTrend));
  const warnings = buildWarnings({
    series,
    unitSeries,
    revenueSeries,
    syncEvents,
    horizonDays
  });

  const forecast = await prisma.salesForecast.create({
    data: {
      storeId,
      productId,
      forecastDate,
      horizonDays,
      predictedUnits,
      predictedRevenue,
      modelName: 'weighted-moving-average-trend-ai',
      confidence: toNumber(confidenceBase)
    }
  });

  return {
    forecast,
    series,
    warnings,
    indicators: {
      shortWindowUnits: toNumber(shortWindowUnits),
      longWindowUnits: toNumber(longWindowUnits),
      shortWindowRevenue: toNumber(shortWindowRevenue),
      longWindowRevenue: toNumber(longWindowRevenue),
      unitsTrend: toNumber(unitsTrend),
      revenueTrend: toNumber(revenueTrend)
    }
  };
};

exports.getForecasts = async () => {
  return prisma.salesForecast.findMany({
    orderBy: { generatedAt: 'desc' },
    include: {
      store: true,
      product: true
    }
  });
};

exports.getForecastById = async (id) => {
  return prisma.salesForecast.findUnique({
    where: { id: Number(id) },
    include: {
      store: true,
      product: true
    }
  });
};