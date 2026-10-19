export default {
    data() {
        return {
            // showFilters: Kontroliše vidljivost filter panela na stranici.
            showFilters: false,

            // showFilters: Kontroliše vidljivost preview sekcije na stranici.
            showPreview: false,

            //draftFilters: Privremeno (sandbox) stanje filtera koje se menja unutar panela pre potvrde
            draftFilters: {},

            // appliedFilters: Aktivno stanje filtera koje direktno utiče na rezultate u tabeli i prikaz "pilova".
            appliedFilters: {},

            /** Ključ pod kojim se filteri čuvaju u localStorage. Obavezno definisati po stranici kako ne bi došlo do konflikta između različitih filtera. */ 
            filterStorageKey: null,

            /**  
             * Opciona funkcija za transformaciju filtera pre čuvanja u localStorage. 
             * Koristi se kada filteri sadrže specijalne tipove (npr. Date, Proxy objekti, kompleksne strukture) koje je potrebno serijalizovati u JSON-friendly format.
             * 
             * @type {(filters: Object) => Object | null}
             * @example
             * (filters) => ({
             *   ...filters,
             *   dateFrom: filters.dateFrom?.toISOString(),
             * })
             */
            filterSerializer: null,

            /**
             * Opciona funkcija za transformaciju filtera nakon učitavanja iz localStorage.
             * Koristi se za vraćanje podataka u originalni oblik (npr. string → Date).
             * 
             * @type {(filters: Object) => Object | null}
             * @example
             * (filters) => ({
             *   ...filters,
             *   dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : null,
             * })
             */
            filterDeserializer: null,
            
            // tableRefs: Niz naziva (ref) DataTable komponenti koje Mixin treba automatski da osveži.
            tableRefs: [], 

            // treeRefs: Niz naziva (ref) JsTree komponenti koje Mixin treba automatski da sinhronizuje ili resetuje
            treeRefs: [],
            
            // searchTimer: Služi za kontrolu debounce mehanizma(da se ne okida poziv na svaki klik) prilikom kucanja u polju za pretragu dataTable.
            searchTimer: null
        };
    },

    methods: {
        /**
         * Duboko kloniranje: Kida referencu ali čuva Date objekte.
         * Neophodno da "Odustani" u panelu stvarno poništi izmene.
         */
        safeClone(obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            } 
            if (obj instanceof Date) {
                return new Date(obj.getTime());
            } 
            if (Array.isArray(obj)) {
                return obj.map(item => this.safeClone(item));
            } 
            
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.safeClone(obj[key]);
            });
            return cloned;
        },

        /**
         * Automatizovano osvežavanje svih registrovanih DataTables instanci na stranici. U 99% slucajeva, imamo samo jednu DataTables po strani/komponenti, ali metoda je funkcionalna i ako imamo više od jedne DataTable za iste filtere
         */
        reloadTable(resetPaging = true) {
            if (!this.tableRefs || this.tableRefs.length === 0) return;

            this.tableRefs.forEach(refName => {
                const table = this.$refs[refName];
                if (table && typeof table.reload === 'function') {
                    table.reload(resetPaging);
                }
            });
        },

        // Search & PerPage (univerzalni hendleri za tableState)
        handlePerPageChange(value) {
            if (!this.tableState) return;

            this.tableState.perPage =
                value === null || value === undefined || value === ''
                    ? null
                    : Number(value);

            const effectivePerPage =
                Number(this.tableState.perPage) ||
                Number(this.initialPageLength) ||
                10;

            this.$nextTick(() => {
                if (!this.tableRefs || this.tableRefs.length === 0) return;

                this.tableRefs.forEach(refName => {
                    const table = this.$refs[refName];

                    if (table && typeof table.setPageLength === 'function') {
                        table.setPageLength(effectivePerPage);
                    }
                });
            });
        },
        
        debounceSearch() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.reloadTable(true);
            }, 500);
        },

        handleApply(filters) {
            this.appliedFilters = this.safeClone(filters);
            this.showPreview = this.hasFilters();
            this.showFilters = true;
            this.$nextTick(() => this.reloadTable());
        },

        handleReset() {
            const initial = this.getInitialFilters();
            this.draftFilters = this.safeClone(initial);
            this.appliedFilters = this.safeClone(initial);

            if (this.filterStorageKey) {
                localStorage.removeItem(this.filterStorageKey);
            }
            
            // Reset svih registrovanih stabala (JsTree)
            this.treeRefs.forEach(ref => {
                if (this.$refs[ref]?.clearSelection) {
                    this.$refs[ref].clearSelection();
                }
            });

            this.$nextTick(() => this.reloadTable());
        },

        /**
         * Selektivno uklanjanje filtera i automatska sinhronizacija sa povezanim eksternim komponentama (JsTree)
         * Automatski sinhronizuje filter panel i deselektuje čvorove u stablu.
         */
        handleRemoveFilter({ key, item }) {
            const current = this.appliedFilters[key];

            if (item && Array.isArray(current)) {
                // Brisanje jednog elementa iz niza (Statusi, Zaposleni...)
                const updated = current.filter(i => {
                    const itemId = item.id || item;
                    const currentId = i.id || i;
                    return currentId !== itemId;
                });

                const finalValue = updated.length > 0 ? updated : null;
                this.appliedFilters[key] = finalValue;
                this.draftFilters[key] = this.safeClone(finalValue);

                // Integracija sa TreeComponentom preko nodeId
                if (key === 'selectedEmployees' && item.nodeId) {
                    this.treeRefs.forEach(ref => {
                        this.$refs[ref]?.deselectById?.(item.nodeId);
                    });
                }
            } 
            else {
                // Resetovanje single vrednosti
                const resetVal = typeof current === 'boolean' ? false : null;
                this.appliedFilters[key] = resetVal;
                this.draftFilters[key] = resetVal;

                if (key === 'selectedEmployees') {
                    this.treeRefs.forEach(ref => this.$refs[ref]?.clearSelection?.());
                }
            }

            this.$nextTick(() => this.reloadTable());
        },

        handleClearAll() {
            this.handleReset();
        },

        hasFilters() {
            for (const key in this.appliedFilters) {
                const value = this.appliedFilters[key];

                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        return true;
                    }
                    continue;
                }

                if (value !== null && value !== undefined && value !== false && value !== '') {
                    return true;
                }
            }

            return false;
        },

        /**
         * Čuva filtere u localStorage.
         * 
         * Ako je definisan `filterSerializer`, koristi se za transformaciju podataka pre čuvanja (npr. Date → string).
         * 
         * @param {Object} filters - Objekat filtera koji se čuva
         * @returns {void}
         */
        saveFiltersToStorage(filters) {
            if (!this.filterStorageKey) return

            let dataToSave = filters

            if (typeof this.filterSerializer === 'function') {
                dataToSave = this.filterSerializer(filters)
            }

            localStorage.setItem(this.filterStorageKey, JSON.stringify(dataToSave))
        },

        /**
         * Učitava filtere iz localStorage.
         * 
         * Ako je definisan `filterDeserializer`, koristi se za transformaciju podataka nakon učitavanja (npr. string → Date).
         * 
         * @returns {Object|null} Vraća parsirane filtere ili null ako ne postoje / greška
         */
        loadFiltersFromStorage() {
            if (!this.filterStorageKey) return null;

            const saved = localStorage.getItem(this.filterStorageKey)
            if (!saved) return null

            try {
                let parsed = JSON.parse(saved)

                if (typeof this.filterDeserializer === 'function') {
                    parsed = this.filterDeserializer(parsed)
                }

                return parsed;
            } catch (e) {
                console.error('Greška pri parsiranju filtera', e)
                return null;
            }
        },
    },

    mounted() {
        if (!this.filterStorageKey) return

        const saved = this.loadFiltersFromStorage()

        if (saved) {
            this.draftFilters = this.safeClone(saved)
            this.appliedFilters = this.safeClone(saved)
            this.showPreview = this.hasFilters()
        }
    }
};
