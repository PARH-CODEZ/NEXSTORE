import prisma from '@/lib/prisma';
import { subMonths, startOfMonth, endOfMonth, parseISO, subDays, startOfDay, format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {

        {/*  DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }

        const nows = new Date();
        const currentStart = subDays(nows, 30); // Last 30 days
        const previousStart = subDays(currentStart, 30); // 30–60 days ago

        // 1. Fetch current period sales
        const current = await prisma.orderItem.groupBy({
            by: ['variantId'],
            where: {
                order: {
                    placedAt: {
                        gte: currentStart,
                        lte: nows,
                    },
                    status: {
                        in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'],
                    },
                },
            },
            _sum: {
                quantity: true,
                totalPrice: true,
            },
            orderBy: {
                _sum: {
                    totalPrice: 'desc',
                },
            },
            take: 5,
        });

        const previous = await prisma.orderItem.groupBy({
            by: ['variantId'],
            where: {
                order: {
                    placedAt: {
                        gte: previousStart,
                        lt: currentStart,
                    },
                    status: {
                        in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'],
                    },
                },
            },
            _sum: {
                totalPrice: true,
            },
        });

        const prevMap = new Map();
        previous.forEach((item) => {
            prevMap.set(item.variantId, item._sum.totalPrice?.toNumber() || 0);
        });

        // 2. Fetch variant + product info
        const variantIds = current.map((item) => item.variantId);
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
                product: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        const productResult = current.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId);
            const currRevenue = item._sum.totalPrice?.toNumber() || 0;
            const prevRevenue = prevMap.get(item.variantId) || 0;
            const growth = prevRevenue
                ? ((currRevenue - prevRevenue) / prevRevenue) * 100
                : currRevenue > 0
                    ? 100
                    : 0;

            return {
                name: `${variant?.product.title} (${variant?.varianttitle})`,
                sales: item._sum.quantity || 0,
                revenue: currRevenue,
                growth: parseFloat(growth.toFixed(2)),
            };
        });



        {/* SELLERS DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }

        const sellerOrders = await prisma.orderItem.groupBy({
            by: ['sellerId'],
            _count: {
                orderId: true,
            },
            orderBy: {
                _count: {
                    orderId: 'desc',
                },
            },
            take: 5,
        });

        const sellerIds = sellerOrders.map((s) => s.sellerId);

        // 2. Get basic seller user info
        const sellers = await prisma.user.findMany({
            where: {
                UserID: { in: sellerIds },
                Role: 'seller',
            },
            select: {
                UserID: true,
                FullName: true,
            },
        });

        // 3. Get seller profile info
        const profiles = await prisma.sellerProfile.findMany({
            where: {
                SellerID: { in: sellerIds },
            },
            select: {
                SellerID: true,
                BusinessName: true,
                TotalProducts: true,
            },
        });

        // 4. Merge data into final output
        const profileMap = new Map(profiles.map((p) => [p.SellerID, p]));

        const topSellers = sellers.map((seller) => {
            const profile = profileMap.get(seller.UserID);
            const orderInfo = sellerOrders.find((o) => o.sellerId === seller.UserID);

            return {
                name: profile?.BusinessName || seller.FullName,
                totalOrders: orderInfo?._count.orderId || 0,
                totalProducts: profile?.TotalProducts || 0,
            };
        });





        {/* PAYMENT DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }

        const payments = await prisma.payment.findMany({
            select: {
                status: true,
                amount: true,
                createdAt: true,
            }
        })


        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const statusMap = new Map()

        for (const payment of payments) {
            const monthIndex = new Date(payment.createdAt).getMonth();
            const month = monthNames[monthIndex]

            if (!statusMap.has(month)) {
                statusMap.set(month, { SUCCESS: 0, PENDING: 0, FAILED: 0 })
            }


            const monthData = statusMap.get(month)
            if (['SUCCESS', 'PENDING', 'FAILED'].includes(payment.status)) {
                monthData[payment.status] += Number(payment.amount);
            }


        }

        const paymentStatusData = monthNames.map((month) => ({
            month,
            ...(statusMap.get(month) || { SUCCESS: 0, PENDING: 0, FAILED: 0 }),
        }));



        {/* CATEGORY DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }

        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    status: { notIn: ['CANCELLED', 'RETURNED'] }
                }
            },
            select: {
                quantity: true,
                variant: {
                    select: {
                        product: {
                            select: {
                                category: {
                                    select: {
                                        CategoryName: true,

                                    }
                                }
                            }
                        }
                    }
                }
            }
        });



        const categoryMap = new Map();
        let totalQuantity = 0

        for (const item of orderItems) {
            const category = item.variant.product.category.CategoryName;
            const qty = item.quantity;
            totalQuantity += qty

            categoryMap.set(category, (categoryMap.get(category) || 0) + qty)
        }


        const colors = generateCategoryColors(categoryMap.size);

        const result = Array.from(categoryMap.entries()).map(([name, qty], index) => ({
            name,
            value: Math.round((qty / totalQuantity) * 100),
            color: colors[index % colors.length]
        }));





        {/* SALES DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }
        const range = req.nextUrl.searchParams.get('range') || '30d';

        let fromDate;
        let groupBy;

        switch (range) {
            case '7d':
                fromDate = subDays(new Date(), 6);
                groupBy = 'day';
                break;
            case '30d':
                fromDate = subDays(new Date(), 29);
                groupBy = 'day';
                break;
            case '90d':
                fromDate = subMonths(new Date(), 3);
                groupBy = 'month';
                break;
            case '1y':
                fromDate = subMonths(new Date(), 12);
                groupBy = 'month';
                break;
            default:
                fromDate = subDays(new Date(), 29);
                groupBy = 'day';
        }


        const rawOrders = await prisma.order.findMany({
            where: {
                placedAt: { gte: startOfDay(fromDate) },
                status: { notIn: ['CANCELLED', 'RETURNED'] }
            },
            select: {
                placedAt: true,
                totalAmount: true,
                userId: true
            }
        });


        const grouped = new Map();

        for (const order of rawOrders) {
            const dateKey =
                groupBy === 'day' ? format(order.placedAt, 'MMM d') : format(order.placedAt, 'MMM');

            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, {
                    revenue: 0,
                    orders: 0,
                    customers: new Set()
                });
            }

            const group = grouped.get(dateKey);
            group.revenue += Number(order.totalAmount);
            group.orders += 1;
            group.customers.add(order.userId);
        }


        const sales = Array.from(grouped.entries()).map(([date, data]) => ({
            date,
            revenue: Math.round(data.revenue),
            orders: data.orders,
            customers: data.customers.size
        }));

        sales.sort((a, b) => {
            const months = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
            };
            const [aMonth] = a.date.split(' ');
            const [bMonth] = b.date.split(' ');
            return (months[aMonth] ?? 0) - (months[bMonth] ?? 0);
        });





        {/* STAT CARD DATA  ---------------------------------------------------------------------------------------------------------------------------------------------*/ }
        const now = new Date();
        const startThisMonth = startOfMonth(now);
        const endThisMonth = endOfMonth(now);

        const startLastMonth = startOfMonth(subMonths(now, 1));
        const endLastMonth = endOfMonth(subMonths(now, 1));

        const [
            thisMonthRevenue,
            lastMonthRevenue,
            thisMonthOrders,
            lastMonthOrders,
            thisMonthCustomers,
            lastMonthCustomers,
            thisMonthProductsSold,
            lastMonthProductsSold
        ] = await Promise.all([
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    placedAt: { gte: startThisMonth, lte: endThisMonth },
                    status: { notIn: ['CANCELLED', 'RETURNED'] }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    placedAt: { gte: startLastMonth, lte: endLastMonth },
                    status: { notIn: ['CANCELLED', 'RETURNED'] }
                }
            }),
            prisma.order.count({
                where: {
                    placedAt: { gte: startThisMonth, lte: endThisMonth },
                    status: { notIn: ['CANCELLED'] }
                }
            }),
            prisma.order.count({
                where: {
                    placedAt: { gte: startLastMonth, lte: endLastMonth },
                    status: { notIn: ['CANCELLED'] }
                }
            }),
            prisma.user.count({
                where: {
                    IsActive: true,
                    Role: 'customer',
                    CreatedAt: { gte: startThisMonth, lte: endThisMonth }
                }
            }),
            prisma.user.count({
                where: {
                    IsActive: true,
                    Role: 'customer',
                    CreatedAt: { gte: startLastMonth, lte: endLastMonth }
                }
            }),
            prisma.orderItem.aggregate({
                _sum: { quantity: true },
                where: {
                    order: {
                        placedAt: { gte: startThisMonth, lte: endThisMonth }
                    }
                }
            }),
            prisma.orderItem.aggregate({
                _sum: { quantity: true },
                where: {
                    order: {
                        placedAt: { gte: startLastMonth, lte: endLastMonth }
                    }
                }
            })
        ]);

        const currentRevenue = thisMonthRevenue._sum.totalAmount || 0;
        const previousRevenue = lastMonthRevenue._sum.totalAmount || 0;

        const currentProductsSold = thisMonthProductsSold._sum.quantity || 0;
        const previousProductsSold = lastMonthProductsSold._sum.quantity || 0;

        const calcPercent = (current, previous) =>
            previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

        const stats = [
            {
                label: 'Total Revenue',
                value: currentRevenue,
                change: Number(calcPercent(currentRevenue, previousRevenue).toFixed(2)),
                isPositive: currentRevenue >= previousRevenue
            },
            {
                label: 'Total Orders',
                value: thisMonthOrders,
                change: Number(calcPercent(thisMonthOrders, lastMonthOrders).toFixed(2)),
                isPositive: thisMonthOrders >= lastMonthOrders
            },
            {
                label: 'Active Customers',
                value: thisMonthCustomers,
                change: Number(calcPercent(thisMonthCustomers, lastMonthCustomers).toFixed(2)),
                isPositive: thisMonthCustomers >= lastMonthCustomers
            },
            {
                label: 'Products Sold',
                value: currentProductsSold,
                change: Number(calcPercent(currentProductsSold, previousProductsSold).toFixed(2)),
                isPositive: currentProductsSold >= previousProductsSold
            }
        ];

        return NextResponse.json({ stats, sales, result, paymentStatusData, topSellers,productResult });
    } catch (error) {
        console.error('Dashboard Metrics Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}



function generateCategoryColors(count) {
    const colors = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 50%, 50%)`); // Bright, readable
    }

    return colors;
}
