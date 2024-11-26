<template>
    <v-container class="pa-5" fluid>
        <page-title>
            Prepress
        </page-title>

        <v-row>
            <v-col
                cols="6"
                sm="6"
            >
                <v-row>
                    <v-col cols="12">
                        <h2 class="text-h6">
                            Orders
                        </h2>
                    </v-col>
                </v-row>
                <v-card>
                    <v-data-table
                        :headers="headers"
                        :items="orders"
                        :loading="ordersLoading"
                        :footer-props="footerProps"
                        :server-items-length="pagination.itemsLength"
                        :page.sync="pagination.page"
                        :items-per-page.sync="pagination.itemsPerPage"
                        :mobile-breakpoint="0"
                        name="ordersData"
                        @pagination="updatePagination"
                    >
                        <template #item="{item}">
                            <tr
                                draggable
                                @dragstart="(event) => dragStartHandler(event, item)"
                                @dragend="(event) => dragEndHandler(event, item)"
                            >
                                <td>{{ item.productionNumber }}</td>
                                <td>
                                    <span v-if="item.customer">
                                        {{ item.customer.name }}
                                    </span>
                                    <span v-else> - </span>
                                </td>
                                <td>{{ formatDate(item.createdAt) }}</td>
                                <td>
                                    {{ item.status.name }}
                                    <v-tooltip v-if="item.overdue" :open-delay="tooltipDelay" top>
                                        <template #activator="{on}">
                                            <v-icon color="warning" small v-on="on">
                                                mdi-clock-outline
                                            </v-icon>
                                        </template>
                                        <span>Opóźnione</span>
                                    </v-tooltip>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
            <v-col
                cols="6"
                sm="6"
            >
                <v-row>
                    <v-col cols="12">
                        <h2 class="text-h6">
                            Selected orders
                        </h2>
                    </v-col>
                </v-row>
                <v-row class="fill-height">
                    <v-col ref="selectedOrderZone" cols="12" :style="getZoneStyle">
                        <v-card v-if="isLoadOrderDetail" loading class="mb-6">
                            <v-skeleton-loader
                                type="card-heading, list-item-three-line"
                            />
                        </v-card>

                        <v-card v-for="(order, index) in selectedOrders" :key="order.id" class="mb-6">
                            <v-col cols="12">
                                <v-card-title>
                                    {{ order.productionNumber }}
                                </v-card-title>
                                <v-row>
                                    <v-col cols="6" md="6">
                                        <table class="table table--simple">
                                            <tbody>
                                                <tr>
                                                    <th>Typ zamówienia:</th>
                                                    <td>{{ order.productionNumber && order.productionNumber.split('_', 1)[0] }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Nazwa zamówienia:</th>
                                                    <td>{{ parseEmptyValue(order.name) }}</td>
                                                </tr>
                                                <tr v-if="order.customer">
                                                    <th>Klient:</th>
                                                    <td>{{ order.customer.name }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Cena netto sprzedaży:</th>
                                                    <td>{{ formatPrice(order.netPrice) }} zł</td>
                                                </tr>
                                                <tr>
                                                    <th>Koszt materiałów:</th>
                                                    <td>{{ formatPrice(order.valuation) }} zł</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </v-col>
                                    <v-col cols="6" md="6">
                                        <table class="table table--simple">
                                            <tbody>
                                                <tr>
                                                    <th>Data zamówienia:</th>
                                                    <td>{{ formatDate(order.createdAt) }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Planowana data wysyłki:</th>
                                                    <td>{{ formatDate(order.plannedSendDate) }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Planowana data dostawy:</th>
                                                    <td>{{ formatDate(order.plannedDeliveryDate) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </v-col>
                                    <v-col v-if="order.description" cols="12">
                                        <table class="table table--simple table--align-left">
                                            <tbody>
                                                <tr>
                                                    <th>Uwagi do zamówienia:</th>
                                                    <td width="100%">
                                                        {{ order.description }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import PageTitle from '@/components/common/PageTitle'
import dragAndDrop from '@/mixins/dragAndDrop.js'
import { errorHandler } from '@/utils/errorHandler'
import filters from '@/mixins/dataTableFilters'
import pagination from '@/mixins/dataTablePagination'
import priceFormatter from '@/mixins/priceFormatter'
import tooltipDelay from '@/mixins/tooltip'
import parse from '@/mixins/parse'
import dateFormatter from '@/mixins/dateFormatter'

//import { errorHandler } from '@/utils/errorHandler'
export default {
    name: 'PlanningPlanningPlanning',
    components: {
        PageTitle,
    },
    mixins: [
        dragAndDrop,
        tooltipDelay,
        filters,
        pagination,
        dateFormatter,
        priceFormatter,
        parse,
    ],
    beforeRouteLeave(to, from, next) {
        if (!this.filtersCleared) {
            this.$store.dispatch('orders/clearInternalOrdersFilters')
            this.clearSelectedListItemId()
        }
        this.resetFiltersCleared()
        next()
    },
    data() {
        return {
            headers: [
                {
                    text: 'Numer zamówienia',
                    value: 'productionNumber',
                    sortable: false,
                    width: 200
                },
                {
                    text: 'Klient',
                    value: 'customerName',
                    sortable: false,
                    align: 'left',
                },
                {
                    text: 'Data zamówienia',
                    value: 'createdAt',
                    sortable: false,
                    align: 'center'
                },
                {
                    text: 'Status',
                    value: 'status',
                    sortable: false,
                    align: 'center'
                },
            ],
            selectedOrders: [],
            isDragStart: false,
            isLoadOrderDetail: false
        }
    },
    computed:{
        ordersLoading() {
            return this.$store.state.orders.order.ordersLoading
        },
        orders() {
            return this.$store.state.orders.order.orders
        },
        getZoneStyle() {
            if (this.isDragStart) {
                return 'border: 2px dashed #3498db; border-radius: 5px;'
            }

            return ''
        },
        filterQuery() {
            const filters = this.filters
            let query = ''

            for (let item in filters) {
                if (filters[item] != null && filters[item] != '') {
                    if (item === 'createdBy_id') {
                        filters[item] = this.userId
                    }

                    query = query.concat('&', `${item}=${filters[item]}`)
                }
            }

            return query
        }
    },
    mounted() {
        this.getOrders()

       // this.selectedOrders.push(this.orders[5])

        // Set up drop zones
        console.log(this.$refs.selectedOrderZone)
        this.addDropZone(this.$refs.selectedOrderZone, this.selectedOrders)
        //this.addDropZone(this.$refs.mySecondDropZone, this.itemsTwo)
        // Set up callback functions
        this.setSuccessFn(this.dragSuccess)
        this.setStartFn(() => this.isDragStart = true)
        this.setFailedFn(() => this.isDragStart = false)

        this.setEnterFn(this.dropEnter)
        this.setLeaveFn(this.dropLeave)
        // Init drag&drop
        this.dragAndDropStart()
    },
    methods: {


        getOrders() {
            this.$store.dispatch('orders/getOrders', {
                paginate: this.paginate(),
                query: this.filterQuery
            })
                .then(response => {
                    this.handlePaginationResponse(response)

                })
                .catch(error => {
                    errorHandler(error)
                })
        },
        getOrderDetail(id) {
            this.$store.dispatch('orders/getOrder', id)
                .then(response => {
                    const data = response.data

                    this.selectedOrders.unshift(data)
                    this.isLoadOrderDetail = false
                })
                .catch(error => {
                    errorHandler(error)
                })
        },
        updatePagination(pagination) {
            this.pagination = pagination
            this.evaluateSavedPagination(this.$options.name)
            if (pagination.pageCount !== 0 && !this.paginationSettings.paginationPending && !this.savedPagination.pagination) {
                this.getOrders()
            }
            this.clearPaginationPending()
        },


        ////// Drag & Drop \\\\\\
        dragSuccess({ item, to, from }) {
            this.isLoadOrderDetail = true
            this.isDragStart = false
            this.getOrderDetail(item.id)
        },
        dropEnter({ ref, data }) {
            console.log('ENTER')
        },
        dropLeave({ ref, data }) {
            console.log('LEAVE')
        },

        /* physicallyMove({ item, to, from }) {
            const index = from.findIndex(listItem => _.isEqual(listItem, item))
            if (index > -1) {
                from.splice(index, 1)
                to.push(item)
            }
        }, */
    }
}
</script>
