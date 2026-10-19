<template>
    <!-- ===== composites/page/KLayout.vue: cela strana je unutar ove komponente ===== -->
    <KLayout>
        <!-- ===== composites/sidebar/KSidebar.vue (+ KSidebarItem.vue, KSidebarChildItem.vue) ===== -->
        <template #sidebar>
            <KSidebar
                :items="sidebarItems"
                :module="{ icon: 'module-icons/e-obrasci', color: 'yellow-icon', label: 'e-Obrasci' }"
                current-path="/komponente"
                @item-click="onSidebarItemClick"
            />
        </template>

        <!-- ===== composites/header/KHeader.vue (+ KHeaderModal.vue, KNotificationRow.vue) ===== -->
        <template #header>
            <KHeader :actions="headerActions" :user="user" @action-click="onHeaderAction">
                <!-- dodatne aplikacije -->
                <KHeaderModal id="additional-applications-modal" title="Aplikacije" size="md">
                    <div v-for="app in apps" :key="app.icon" class="header-content-row cursor-pointer" @click="$toast.info(app.label)">
                        <div class="header-content-icon"><span class="icon-lg"><k-icon :name="app.icon" /></span></div>
                        <div class="header-content-content"><div class="content-top">{{ app.label }}</div></div>
                    </div>
                </KHeaderModal>

                <!-- notifikacije -->
                <KHeaderModal id="notifications-modal" title="Notifikacije">
                    <template #menu>
                        <div class="header-tabs">
                            <ul class="nav nav-tabs" role="tablist">
                                <li class="nav-item">
                                    <button type="button" class="nav-link" :class="{ active: notificationTab === 'all' }" @click="notificationTab = 'all'">Sve</button>
                                </li>
                                <li class="nav-item">
                                    <button type="button" class="nav-link" :class="{ active: notificationTab === 'unread' }" @click="notificationTab = 'unread'">Nepročitane</button>
                                </li>
                            </ul>
                        </div>
                        <div class="header-action">
                            <button type="button" class="bg-transparent border-0 p-0 b-small-font text-reset" @click="markAllRead">Pročitane</button>
                        </div>
                    </template>

                    <KNotificationRow
                        v-for="n in visibleNotifications"
                        :key="n.id"
                        :icon="n.icon"
                        :title="n.title"
                        :text-html="n.text"
                        :time="n.time"
                        :unread="n.unread"
                        :link-url="n.link"
                        @row-click="n.unread = false"
                        @open-link="$toast.info('Link: ' + n.link)"
                    />
                    <div v-if="!visibleNotifications.length" class="px-4 pt-3 muted-text-color">Nema notifikacija.</div>
                </KHeaderModal>

                <!-- poslednji dokumenti -->
                <KHeaderModal id="last-used-documents-modal" title="Poslednje korišćeni dokumenti" size="sm">
                    <div v-for="doc in documents" :key="doc.id" class="header-content-row">
                        <div class="header-content-icon">
                            <span class="icon-lg"><k-icon name="circle-icons/pdf" /></span>
                        </div>
                        <div class="header-content-content">
                            <div class="content-top">
                                <div class="last-used-document-link"><a href="#">{{ doc.name }}</a></div>
                            </div>
                            <div class="content-bot justify-content-start">
                                <span class="date me-3"><span class="icon-sm me-1"><k-icon name="calendar-a" /></span><span>{{ doc.date }}</span></span>
                                <span class="time"><span class="icon-sm me-1"><k-icon name="time" /></span><span>{{ doc.time }}</span></span>
                            </div>
                        </div>
                    </div>
                </KHeaderModal>

                <!-- nalog -->
                <KHeaderModal id="account-modal" size="md" menu :wrap-content="false">
                    <template #header>
                        <div class="header-modal-header-with-image">
                            <div class="header-image">
                                <KAvatar :src="user.avatar" :who="user.fullName" size="large" />
                            </div>
                            <div class="header-info">
                                <span class="primary-text-color b-big-font">{{ user.fullName }}</span>
                                <span class="b-small-font muted-text-color">{{ user.email }}</span>
                                <span class="b-small-font normal-text-color">Superadministrator</span>
                            </div>
                        </div>
                    </template>

                    <div class="header-content">
                        <div class="header-content-row" @click="toggleTheme()">
                            <div class="header-content-icon"><span class="icon-md primary-color"><k-icon :name="theme === 'dark' ? 'light-theme' : 'dark-theme'" /></span></div>
                            <div class="header-content-content"><div class="link">Promeni temu (trenutno: {{ theme }})</div></div>
                        </div>
                        <div class="header-content-row">
                            <div class="header-content-icon"><span class="icon-md primary-color"><k-icon name="profile" /></span></div>
                            <div class="header-content-content"><div class="link">Moj profil</div></div>
                        </div>
                        <hr class="my-0" />
                        <div class="header-content-row">
                            <div class="header-content-icon"><span class="icon-md primary-color"><k-icon name="sign-out" /></span></div>
                            <div class="header-content-content"><div class="link">Odjava naloga</div></div>
                        </div>
                    </div>
                </KHeaderModal>
            </KHeader>
        </template>

        <!-- ===== composites/page/KPageSection.vue: okvir sadrzaja ===== -->
        <KPageSection title="@kancelarko/ui – sve komponente" icon="icons-3d/benefits">
            <template #actions>
                <div class="main-section-header-button d-flex flex-wrap gap-3">
                    <button class="btn btn-outline-primary btn-sm" @click="toggleTheme()">Tema: {{ theme }}</button>
                    <button class="btn btn-primary btn-sm" @click="showToast">$toast</button>
                    <button class="btn btn-primary btn-sm" @click="showAlert">$alert</button>
                </div>
            </template>

            <!-- SADRZAJ -->
            <div class="demo-block">
                <div class="demo-block__head">
                    <span class="demo-block__file"><code>Sadržaj</code></span>
                    <span class="demo-block__path">{{ componentIndex.length }} komponenti iz src/components – svaka ima blok ispod, sa tačnim nazivom fajla</span>
                </div>
                <div class="demo-toc">
                    <a v-for="c in componentIndex" :key="c.name" :href="'#demo-' + c.name.replace('.vue', '')">{{ c.name }}</a>
                </div>
            </div>

            <!-- ======================= LAYOUT ======================= -->
            <span class="main-section-title d-block mb-4">Layout</span>

            <DemoBlock name="KLayout.vue" path="composites/page/KLayout.vue" note="Cela ova strana je unutar KLayout-a: slot #sidebar levo, slot #header gore, sadržaj u .main. Prati layoutStore (sklopljen sidebar, mobilni meni).">
                <KInfoBox>Probaj: klikni ikonicu ☰ u vrhu sidebara (sklapanje) ili smanji prozor ispod 992px (mobilni meni kroz hamburger u headeru).</KInfoBox>
            </DemoBlock>

            <DemoBlock name="KSidebar.vue" path="composites/sidebar/KSidebar.vue" note="Levi meni na ovoj strani. Stavke dolaze iz propa items (vidi sidebarItems u dev/App.vue), modul iz propa module, logo se menja po temi.">
                <div class="d-flex flex-wrap gap-3">
                    <button class="btn btn-outline-primary btn-sm" @click="layoutStore.toggleMinimizeSidebar()">layoutStore.toggleMinimizeSidebar()</button>
                    <button class="btn btn-outline-primary btn-sm" @click="layoutStore.toggleSidebar()">layoutStore.toggleSidebar() (mobilni)</button>
                </div>
            </DemoBlock>

            <DemoBlock name="KSidebarItem.vue" path="composites/sidebar/KSidebarItem.vue" note="Jedna stavka menija (koristi je KSidebar). Ovde prikazana samostalno, u mini sidebar okviru.">
                <div class="sidebar demo-inline-sidebar">
                    <div class="sidebar-content">
                        <div class="sidebar-navigation">
                            <KSidebarItem icon="calendar" color="yellow-icon" label="Kalendar" url="/kalendar" current-path="/kalendar" @click="() => $toast.info('KSidebarItem klik')" />
                            <KSidebarItem icon="absence" color="pink-icon" label="Odsustva" current-path="/odsustva/zahtevi" :children="[{ label: 'Zahtevi', url: '/odsustva/zahtevi' }, { label: 'Rešenja', url: '/odsustva/resenja' }]" />
                        </div>
                    </div>
                </div>
            </DemoBlock>

            <DemoBlock name="KSidebarChildItem.vue" path="composites/sidebar/KSidebarChildItem.vue" note="Podstavka menija (drugi i treći nivo). Koristi je KSidebarItem; ovde samostalno.">
                <div class="sidebar demo-inline-sidebar">
                    <div class="sidebar-content">
                        <div class="sidebar-navigation">
                            <div class="sidebar-nav-row">
                                <div class="sidebar-nav-children collapse show">
                                    <KSidebarChildItem label="Zahtevi (aktivna)" url="/odsustva/zahtevi" current-path="/odsustva/zahtevi" />
                                    <KSidebarChildItem label="Rešenja" url="/odsustva/resenja" current-path="/odsustva/zahtevi" />
                                    <KSidebarChildItem label="Masovne akcije" url="javascript:void(0)" current-path="/odsustva/zahtevi" :children="[{ label: 'Utvrđivanje GO', url: '/odsustva/masovne-akcije/go' }]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DemoBlock>

            <DemoBlock name="KHeader.vue" path="composites/header/KHeader.vue" note="Gornja traka ove strane: ikonice levo od avatara dolaze iz propa actions (link, modal ili onClick), avatar iz propa user. Klikni ikonice gore da vidiš header modale.">
                <KInfoBox>Akcije u ovom demo-u: Gold paket (link), Paragraf AI (link), Webinari (link), Popusti (link), Stručni tekstovi (disabled), PK dokumenti (modal), Poruke (onClick), Aplikacije (modal), Notifikacije (modal), Promeni temu (onClick).</KInfoBox>
            </DemoBlock>

            <DemoBlock name="KHeaderModal.vue" path="composites/header/KHeaderModal.vue" note="Padajući modal ispod header ikonice. Na ovoj strani ih ima četiri: Aplikacije (size md), Notifikacije (lg, sa #menu tabovima), PK dokumenti (sm) i Nalog (menu varijanta, klik na avatar).">
                <div class="d-flex flex-wrap gap-3">
                    <KInfoBox icon-name="notification">Klikni ikonicu zvona u headeru → KHeaderModal id="notifications-modal".</KInfoBox>
                    <KInfoBox icon-name="profile">Klikni avatar u headeru → KHeaderModal id="account-modal" (menu).</KInfoBox>
                </div>
            </DemoBlock>

            <DemoBlock name="KNotificationRow.vue" path="composites/header/KNotificationRow.vue" note="Jedan red notifikacije. Koristi se unutar KHeaderModal-a; ovde prikazan samostalno.">
                <div class="header-modal show-header-modal demo-inline-modal">
                    <div class="header-modal-main">
                        <div class="header-content">
                            <KNotificationRow icon="circle-icons/holiday-request" title="Zahtev za odmor" text-html="Marko Marković je poslao <b>zahtev za godišnji odmor</b>." time="pre 5 min" unread link-url="/odsustva/zahtevi" @row-click="$toast.info('row-click')" @open-link="$toast.info('open-link')" />
                            <KNotificationRow icon="circle-icons/birthday" title="Rođendan" text-html="Jovana Jovanović danas slavi rođendan." time="danas" />
                        </div>
                    </div>
                </div>
            </DemoBlock>

            <DemoBlock name="KPageSection.vue" path="composites/page/KPageSection.vue" note="Okvir strane (naslov + 3D ikonica + dugmad desno + sadržaj). Ceo ovaj sadržaj je u jednom KPageSection-u; ispod je još jedan, ugnježden, kao primer.">
                <KPageSection title="Ugnježdena sekcija" icon="icons-3d/contract" section-class="pb-0">
                    <template #actions>
                        <div class="main-section-header-button"><button class="btn btn-primary btn-sm">Dugme</button></div>
                    </template>
                    <span class="main-section-title d-block mb-3">Podnaslov (.main-section-title)</span>
                    <p class="normal-text-color b-small-font">Sadržaj sekcije.</p>
                </KPageSection>
            </DemoBlock>

            <!-- ======================= IKONICA ======================= -->
            <span class="main-section-title d-block mb-4">Ikonica</span>

            <DemoBlock name="KIcon.vue" path="atoms/icon/KIcon.vue" note="Fajl KIcon.vue (ranije Icon.vue), registrovana kao <k-icon> i <KIcon>. Učitava SVG iz src/icons po nazivu (podfolder/naziv). Veličine icon-sm / icon-md / icon-lg, boje *-icon klase.">
                <div class="d-flex flex-wrap align-items-center gap-4 normal-text-color">
                    <k-icon name="calendar" wrapperClass="icon-sm yellow-icon" />
                    <k-icon name="calendar" wrapperClass="icon-md yellow-icon" />
                    <k-icon name="calendar" wrapperClass="icon-lg yellow-icon" />
                    <k-icon name="absence" wrapperClass="icon-md pink-icon" />
                    <k-icon name="contract" wrapperClass="icon-md mint-icon" />
                    <k-icon name="forum" wrapperClass="icon-md dark-blue-icon" />
                    <k-icon name="settings" wrapperClass="icon-md blue-icon" />
                    <k-icon name="delete" wrapperClass="icon-md red-icon" />
                    <k-icon name="circle-icons/holiday-request" wrapperClass="icon-lg" />
                    <k-icon name="circle-icons/pdf" wrapperClass="icon-lg" />
                    <k-icon name="alert-icons/success" wrapperClass="icon-lg" />
                    <k-icon name="icons-3d/user-hub" wrapperClass="icon-lg" />
                    <k-icon name="module-icons/e-obrasci" wrapperClass="icon-lg" />
                </div>
            </DemoBlock>

            <!-- ======================= FORME ======================= -->
            <span class="main-section-title d-block mb-4">Polja u formama</span>

            <DemoBlock name="KTextInput.vue" path="atoms/text-input/KTextInput.vue">
                <div class="row g-4">
                    <div class="col-md-4"><KTextInput v-model="form.name" label="Ime i prezime" /></div>
                    <div class="col-md-4"><KTextInput v-model="form.email" label="Email" error="Validaciona greška." /></div>
                    <div class="col-md-4"><KTextInput v-model="form.phone" label="Telefon (phone-characters-only, light-background)" phone-characters-only success="Sve je u redu." light-background /></div>
                    <div class="col-md-4"><KTextInput v-model="form.digits" label="Samo cifre (digits-only)" digits-only /></div>
                    <div class="col-md-4"><KTextInput model-value="Ne može da se menja" label="Disabled" disabled /></div>
                    <div class="col-md-4"><KTextInput v-model="form.name" label="highlight-error (bez poruke)" highlight-error /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KTextarea.vue" path="atoms/textarea/KTextarea.vue">
                <div class="row g-4">
                    <div class="col-md-6"><KTextarea v-model="form.comment" label="Komentar (raste do 220px)" /></div>
                    <div class="col-md-6"><KTextarea v-model="form.comment2" label="Sa greškom" error="Obavezno polje." :autoresize-max="120" /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KNumberInput.vue" path="atoms/number-input/KNumberInput.vue">
                <div class="row g-4">
                    <div class="col-md-4"><KNumberInput v-model="form.amount" label="Iznos (0–100, korak 0.5)" :min="0" :max="100" :step="0.5" /></div>
                    <div class="col-md-4"><KNumberInput v-model="form.days" label="Dani" :min="1" :max="30" error="Najviše 30 dana." /></div>
                    <div class="col-md-4"><KNumberInput :model-value="5" label="Disabled" disabled /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KCheckbox.vue" path="atoms/checkbox/KCheckbox.vue">
                <div class="d-flex flex-column gap-3">
                    <KCheckbox id="cb1" v-model="form.agree" label="Boolean model: slažem se sa uslovima" />
                    <KCheckbox id="cb2" v-model="form.fruits" value="jabuka" label="Array model: jabuka" />
                    <KCheckbox id="cb3" v-model="form.fruits" value="kruška" label="Array model: kruška" />
                    <KCheckbox id="cb4" v-model="form.yesNo" true-value="DA" false-value="NE" :label="'trueValue/falseValue: ' + form.yesNo" />
                    <KCheckbox id="cb5" :model-value="true" label="Disabled" disabled />
                    <KCheckbox id="cb6" v-model="form.agree" label="Svetlija pozadina (light-background)" light-background />
                </div>
            </DemoBlock>

            <DemoBlock name="KRadio.vue" path="atoms/radio/KRadio.vue">
                <div class="d-flex flex-column gap-3">
                    <KRadio id="r1" v-model="form.gender" name="gender" value="m" label="Muški" />
                    <KRadio id="r2" v-model="form.gender" name="gender" value="f" label="Ženski" />
                    <KRadio id="r3" v-model="form.gender" name="gender" value="x" label="Disabled" disabled />
                </div>
            </DemoBlock>

            <DemoBlock name="KSwitch.vue" path="atoms/switch/KSwitch.vue">
                <div class="d-flex flex-column gap-3">
                    <KSwitch id="sw1" v-model="form.notifications" label="Notifikacije" />
                    <KSwitch id="sw2" v-model="form.darkMode" label="Tamna tema (menja temu strane)" @change="onDarkModeSwitch" />
                    <KSwitch id="sw3" :model-value="true" label="Disabled" disabled />
                </div>
            </DemoBlock>

            <DemoBlock name="KSelect.vue" path="atoms/select/KSelect.vue">
                <div class="row g-4">
                    <div class="col-md-4"><KSelect v-model="form.city" :options="cities" floating-label="Grad (single)" /></div>
                    <div class="col-md-4"><KSelect v-model="form.tags" :options="cities" mode="tags" floating-label="Više gradova (tags + checkbox)" :close-on-select="false" :hide-selected="false" show-option-checkbox /></div>
                    <div class="col-md-4"><KSelect v-model="form.cityValue" :options="cities" :object="false" floating-label="Samo vrednost (object=false)" error="Obavezno polje." /></div>
                    <div class="col-md-4"><KSelect v-model="form.city" :options="cities" floating-label="Mali (size-sm)" size-s-m :can-clear="false" /></div>
                    <div class="col-md-4"><KSelect v-model="form.city" :options="cities" floating-label="Svetlija pozadina" light-background /></div>
                    <div class="col-md-4"><KSelect :model-value="cities[0]" :options="cities" floating-label="Disabled" disabled /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KSelectAsync.vue" path="atoms/select/KSelectAsync.vue" note="Opcije vuče funkcija resolveOptions(query) → Promise. Ovde simulira server sa 300ms kašnjenja.">
                <div class="row g-4">
                    <div class="col-md-6"><KSelectAsync v-model="form.asyncCity" :resolve-options="resolveCities" placeholder="Kucaj naziv grada..." /></div>
                    <div class="col-md-6"><KSelectAsync v-model="form.asyncCities" :resolve-options="resolveCities" mode="multiple" :min-chars="1" :preload="false" placeholder="Više gradova, od 1 slova" /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KEmployeeSelect.vue" path="composites/employee/KEmployeeSelect.vue" note="KSelect prilagođen zaposlenima: avatar + ime + email u opciji i u izabranoj vrednosti.">
                <div class="row g-4">
                    <div class="col-md-6"><KEmployeeSelect v-model="form.employee" :options="employeeOptions" floating-label="Zaposleni" /></div>
                    <div class="col-md-6"><KEmployeeSelect v-model="form.employees" :options="employeeOptions" mode="multiple" floating-label="Više zaposlenih" /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KDatePicker.vue" path="atoms/date-picker/KDatePicker.vue">
                <div class="row g-4">
                    <div class="col-md-3"><KDatePicker v-model="form.date" mode="date" /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.time" mode="time" /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.datetime" mode="datetime" /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.month" mode="month" error="Obavezno polje." /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.year" mode="year" /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.date" mode="date" light-background /></div>
                    <div class="col-md-3"><KDatePicker :model-value="new Date()" mode="date" disabled /></div>
                    <div class="col-md-3"><KDatePicker v-model="form.date" mode="date" :min-date="new Date()" placeholder="Samo od danas" /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KTextEditor.vue" path="atoms/text-editor/KTextEditor.vue" note="TinyMCE učitan sa /tinymce/tinymce.min.js (postinstall paketa ga kopira u public/tinymce). Boja teksta prati temu.">
                <KTextEditor v-model="form.html" placeholder="Unesite tekst..." :height="300" />
            </DemoBlock>

            <!-- ======================= UPLOAD ======================= -->
            <span class="main-section-title d-block mb-4">Upload</span>

            <DemoBlock name="KFileUpload.vue" path="composites/upload/KFileUpload.vue" note="Drag&drop zona za jedan fajl. v-model drži objekat { name, size, status, file }. Fajl ne ide na server – to radiš ti.">
                <div class="row g-4">
                    <div class="col-md-6"><KFileUpload v-model="form.file" /></div>
                    <div class="col-md-6"><KFileUpload v-model="form.file2" title="Dodajte sliku" :accept="['jpg', 'jpeg', 'png']" :max-file-size="2 * 1024 * 1024" show-replace /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KDocumentUpload.vue" path="composites/upload/KDocumentUpload.vue" note="Kartica 'naslov + dugme Dodajte' za jedan dokument. Eventi select / remove, fajl čuva roditelj.">
                <div class="row g-4">
                    <div class="col-md-6"><KDocumentUpload title="Ugovor o radu" :file="docs.single" show-empty-state empty-text="Nema dokumenta" @select="onDocumentSelect" @remove="docs.single = null" /></div>
                    <div class="col-md-6"><KDocumentUpload title="Postojeći dokument sa servera" existing-file-name="resenje-go-2026.pdf" hide-add-when-has-file @remove="$toast.warning('remove')" /></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KDocumentUploadMulti.vue" path="composites/upload/KDocumentUploadMulti.vue" note="Lista više dokumenata: files (već snimljeni, { ID, fileName }) + pendingFiles (izabrani, još nisu poslati).">
                <KDocumentUploadMulti
                    title="Prilozi"
                    :files="docs.saved"
                    :pending-files="docs.pending"
                    can-download
                    can-preview
                    @select="onMultiSelect"
                    @remove-pending="({ index }) => docs.pending.splice(index, 1)"
                    @delete="({ index }) => docs.saved.splice(index, 1)"
                    @download="(f) => $toast.info('Preuzmi: ' + f.fileName)"
                    @preview="({ file }) => $toast.info('Pregled: ' + file.fileName)"
                />
            </DemoBlock>

            <!-- ======================= PRIKAZ ======================= -->
            <span class="main-section-title d-block mb-4">Prikaz podataka</span>

            <DemoBlock name="KAvatar.vue" path="atoms/avatar/KAvatar.vue">
                <div class="d-flex flex-wrap align-items-center gap-4">
                    <KAvatar :who="user.fullName" size="small" />
                    <KAvatar :who="user.fullName" :email="user.email" size="medium" has-tooltip />
                    <KAvatar :who="user.fullName" size="large" closable @close="$toast.warning('close')" />
                    <KAvatar src="https://i.pravatar.cc/150?img=12" who="Ana Anić" size="large" />
                    <KAvatar :who="user.fullName" size="photo" />
                </div>
            </DemoBlock>

            <DemoBlock name="KTooltip.vue" path="atoms/tooltip/KTooltip.vue">
                <div class="d-flex flex-wrap align-items-center gap-4">
                    <KTooltip text="Običan tooltip (hover)"><button class="btn btn-outline-primary btn-sm">Hover</button></KTooltip>
                    <KTooltip title="Naslov" body="Bogatiji tooltip sa naslovom" placement="bottom"><button class="btn btn-outline-primary btn-sm">Naslov + telo</button></KTooltip>
                    <KTooltip mode="click" title="Klik" body="Ostaje otvoren dok ne klikneš ponovo"><button class="btn btn-outline-primary btn-sm">Klik</button></KTooltip>
                    <KTooltip mode="manual" v-model="tooltipOpen" title="Manual" body="Kontrolišeš ga iz koda"><button class="btn btn-outline-primary btn-sm">Manual ({{ tooltipOpen ? 'otvoren' : 'zatvoren' }})</button></KTooltip>
                    <KTooltip title="Slot #body"><button class="btn btn-outline-primary btn-sm">Slot</button><template #body>Polje je <span class="red-text-color">obavezno</span>.</template></KTooltip>
                </div>
            </DemoBlock>

            <DemoBlock name="KInfoBox.vue" path="atoms/info-box/KInfoBox.vue">
                <div class="row g-4">
                    <div class="col-md-6"><KInfoBox>Ovo je informativna poruka u info box-u sa podrazumevanom ikonicom.</KInfoBox></div>
                    <div class="col-md-6"><KInfoBox icon-name="alert" box-class="gray-bg border-radius-10 p-3" content-class="b-small-font red-text-color d-flex align-items-start gap-2">Upozorenje sa drugom ikonicom i bojom.</KInfoBox></div>
                </div>
            </DemoBlock>

            <DemoBlock name="KDataCard.vue" path="atoms/data-card/KDataCard.vue" note="Kartica sa redovima 'naziv – vrednost' i akcijama (gore, u liniji ili po redu).">
                <div class="row g-4">
                    <div class="col-md-6">
                        <KDataCard :rows="dataCardRows">
                            <template #actions>
                                <button class="btn btn-outline-primary btn-sm" @click="$toast.info('Izmeni')">Izmeni</button>
                                <button class="btn btn-primary btn-sm" @click="$toast.warning('Obriši')">Obriši</button>
                            </template>
                        </KDataCard>
                    </div>
                    <div class="col-md-6">
                        <KDataCard :rows="dataCardRows" actions-position="inline">
                            <template #actions>
                                <span class="icon-md primary-color cursor-pointer" @click="$toast.info('Izmeni')"><k-icon name="edit" /></span>
                            </template>
                        </KDataCard>
                    </div>
                </div>
            </DemoBlock>

            <DemoBlock name="KEmployeeCard.vue" path="composites/employee/KEmployeeCard.vue" note="Kartica zaposlenog: avatar, ime, hijerarhija iz employee.wpPath, opciono radno vreme i datum desno.">
                <KEmployeeCard :employee="employeeCard" :work-times="employeeWorkTimes" show-work-time date-label="19.10.2026" border-bottom />
                <KEmployeeCard :employee="employeeCard" :show-date="false" />
            </DemoBlock>

            <DemoBlock name="KPagination.vue" path="atoms/pagination/KPagination.vue">
                <div class="d-flex align-items-center gap-4">
                    <KPagination :current-page="page" :last-page="12" @change="page = $event" />
                    <span class="muted-text-color b-small-font">strana {{ page }} / 12</span>
                </div>
            </DemoBlock>

            <DemoBlock name="KContextMenu.vue" path="atoms/context-menu/KContextMenu.vue" note="Meni koji se otvara na klik (slot #trigger daje toggle/open/close, sadržaj dobija close).">
                <div class="d-flex flex-wrap gap-4">
                    <KContextMenu>
                        <template #trigger="{ toggle }">
                            <button class="btn btn-primary btn-sm" @click="toggle">Otvori meni</button>
                        </template>
                        <template #default="{ close }">
                            <button class="dropdown-item" @click="close(); $toast.success('Izmeni')">Izmeni</button>
                            <button class="dropdown-item" @click="close(); $toast.error('Obriši')">Obriši</button>
                        </template>
                    </KContextMenu>
                    <KContextMenu :min-width="160" :offset-y="10">
                        <template #trigger="{ toggle, isOpen }">
                            <span class="icon-md primary-color cursor-pointer" @click="toggle"><k-icon :name="isOpen ? 'close' : 'dot-dot-dot'" /></span>
                        </template>
                        <template #default="{ close }">
                            <button class="dropdown-item" @click="close()">Opcija 1</button>
                            <button class="dropdown-item" @click="close()">Opcija 2</button>
                        </template>
                    </KContextMenu>
                </div>
            </DemoBlock>

            <!-- ======================= TABELE I FILTERI ======================= -->
            <span class="main-section-title d-block mb-4">Tabele i filteri</span>

            <DemoBlock name="KFilterPanel.vue" path="composites/filters/KFilterPanel.vue" note="Panel sa filterima. v-model je radna kopija (draftFilters iz FilterMixin-a), dugmad Resetuj / Odustani / Potvrdi; slot dobija { filters }.">
                <button class="btn btn-outline-primary btn-sm mb-3" @click="showFilters = !showFilters">
                    <span class="icon-sm me-2 d-inline-flex"><k-icon name="filter" /></span>{{ showFilters ? 'Sakrij filtere' : 'Prikaži filtere' }}
                </button>
                <KFilterPanel v-show="showFilters" v-model="draftFilters" @apply="handleApply" @reset="handleReset" @cancel="showFilters = false">
                    <template #default="{ filters }">
                        <div class="row g-4">
                            <div class="col-md-4"><KSelect v-model="filters.department" :options="departments" :object="false" floating-label="Sektor" light-background /></div>
                            <div class="col-md-4"><KDatePicker v-model="filters.hiredFrom" placeholder="Zaposlen od" light-background /></div>
                            <div class="col-md-4 d-flex align-items-center"><KCheckbox id="flt-active" v-model="filters.onlyActive" label="Samo aktivni" light-background /></div>
                        </div>
                    </template>
                </KFilterPanel>
            </DemoBlock>

            <DemoBlock name="KFilterPreview.vue" path="composites/filters/KFilterPreview.vue" note="Primenjeni filteri kao 'pilule' sa X. Prikazuje se samo kad ima bar jedan filter (potvrdi nešto u panelu iznad).">
                <KFilterPreview :filters="appliedFilters" :labels="filterLabels" :formatters="filterFormatters" @remove-filter="handleRemoveFilter" @clear-all="handleClearAll" />
                <div v-if="!hasFilters()" class="muted-text-color b-small-font">Nema primenjenih filtera.</div>
            </DemoBlock>

            <DemoBlock name="KDataTable.vue" path="composites/datatable/KDataTable.vue" note="DataTables tabela. Ovde client-side (:data + :server-side=false); u projektu obično server-side preko :ajax. Pretraga i filteri iznad utiču na podatke.">
                <div class="row mb-4">
                    <div class="col-md-6"><span class="main-section-title">Zaposleni ({{ filteredEmployees.length }})</span></div>
                    <div class="col-md-6">
                        <div class="row justify-content-end">
                            <div class="col-md-4 mb-2 mb-md-0">
                                <KSelect v-model="table.perPage" :options="perPageOptions" :object="false" :can-clear="false" placeholder="Broj unosa" @update:modelValue="onPerPageChange" />
                            </div>
                            <div class="col-md-8">
                                <div class="input-group input-group-icon-left">
                                    <span class="input-group-icon"><k-icon name="search" wrapperClass="icon-sm" /></span>
                                    <input v-model="table.search" type="text" class="form-control" placeholder="Pretraga">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <KDataTable
                    ref="employeesTable"
                    :columns="tableColumns"
                    :data="filteredEmployees"
                    :server-side="false"
                    :page-length="5"
                    :default-sort="[[0, 'asc']]"
                >
                    <template #column-status="{ rowData }">
                        <span class="pill rounded-pill" :class="rowData.active ? 'bg-success' : 'bg-danger'">{{ rowData.active ? 'Aktivan' : 'Neaktivan' }}</span>
                    </template>
                    <template #column-actions="{ rowData }">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm" @click="$toast.info('Izmeni: ' + rowData.name)">Izmeni</button>
                            <button class="btn btn-primary btn-sm" @click="$toast.warning('Obriši: ' + rowData.name)">Obriši</button>
                        </div>
                    </template>
                </KDataTable>
            </DemoBlock>

            <DemoBlock name="KDataTablePrint.vue" path="composites/datatable/KDataTablePrint.vue" note="Dugme koje povuče sve redove sa backenda (POST na request-url, ovde mock /demo/employees/print) i otvori print dijalog.">
                <KDataTablePrint
                    title="Spisak zaposlenih"
                    print-label="Štampaj tabelu"
                    preparing-label="Priprema..."
                    button-class="btn btn-outline-primary btn-sm"
                    :columns="printColumns"
                    :metadata="[{ key: 'count', label: 'Ukupno zaposlenih:', value: (rows) => rows.length }, { key: 'active', type: 'checkbox', checked: appliedFilters.onlyActive, value: 'Samo aktivni' }]"
                    request-url="/demo/employees/print"
                    :request-columns="tableColumns"
                    :request-filters="appliedFilters"
                    :search="table.search"
                    :get-data-table="() => $refs.employeesTable?.getDt()"
                    no-data-message="Nema podataka za štampu."
                    error-message="Greška pri pripremi štampe."
                >
                    <template #cell-active="{ row }">{{ row.active ? 'Da' : 'Ne' }}</template>
                </KDataTablePrint>
            </DemoBlock>

            <!-- ======================= STABLO ======================= -->
            <span class="main-section-title d-block mb-4">Stablo</span>

            <DemoBlock name="KTree.vue" path="composites/tree/KTree.vue" note="Stablo sa pretragom i čekiranjem (config.checkboxMode: single / auto / manual). Čvor: { id, label, icon, children, disabled }.">
                <div class="row g-4">
                    <div class="col-md-6">
                        <KTree ref="tree" :data="treeData" title="Organizacija (single)" :config="{ showCheckbox: true, searchable: true, checkboxMode: 'single' }" @update:selected="onTreeSelect" />
                    </div>
                    <div class="col-md-6">
                        <KTree :data="treeData" title="Organizacija (auto – bira i decu)" :config="{ showCheckbox: true, searchable: true, checkboxMode: 'auto' }" @update:selected="onTreeSelect" />
                    </div>
                </div>
                <div class="d-flex gap-3 mt-3">
                    <button class="btn btn-outline-primary btn-sm" @click="$refs.tree.selectByIds(['3'])">ref.selectByIds(['3'])</button>
                    <button class="btn btn-outline-primary btn-sm" @click="$refs.tree.clearSelection()">ref.clearSelection()</button>
                </div>
            </DemoBlock>

            <DemoBlock name="KTreeNode.vue" path="composites/tree/KTreeNode.vue" note="Jedan čvor stabla (koristi ga KTree rekurzivno). Ovde prikazan samostalno.">
                <div class="tree-container">
                    <div class="tree-content p-4">
                        <KTreeNode :node="treeData[0].children[0]" :selected="treeNodeSelected" :options="{ showCheckbox: true }" @select="onTreeNodeSelect" />
                    </div>
                </div>
                <div class="muted-text-color b-small-font mt-2">Izabrano: {{ treeNodeSelected.join(', ') || '–' }}</div>
            </DemoBlock>

            <!-- ======================= KALENDAR ======================= -->
            <span class="main-section-title d-block mb-4">Kalendar</span>

            <DemoBlock name="KCalendar.vue" path="composites/calendar/KCalendar.vue" note="FullCalendar sa Kancelarko izgledom. Događaji u FullCalendar formatu sa extendedProps.type (birthday, holiday, task, note, kadrovik, reminder...).">
                <KCalendar :events="calendarEvents" @event-click="onCalendarEventClick" @date-click="onCalendarDateClick" @filter-click="$toast.info('filter-click')" />
            </DemoBlock>

            <DemoBlock name="KCalendarEvent.vue" path="composites/calendar/KCalendarEvent.vue" note="Čip jednog događaja (ikonica + naslov). KCalendar ga koristi za svaki događaj; ovde samostalno.">
                <div class="app-calendar d-flex flex-wrap gap-3">
                    <div v-for="e in calendarEvents" :key="e.id" class="app-calendar__event" :class="'app-calendar__event--' + e.extendedProps.type">
                        <KCalendarEvent :event="e" />
                    </div>
                </div>
            </DemoBlock>
        </KPageSection>
    </KLayout>
</template>

<script>
import DemoBlock from './DemoBlock.vue'
import FilterMixin from '../src/components/composites/filters/filter-mixin'
import { layoutStore } from '../src/components/composites/page/layout-store'
import { getTheme, toggleTheme, onThemeChange } from '../src/helpers/theme'
import { toKancelarkoDateFormat } from '../src/helpers/date'
import { employees, departments, employeeOptions } from './demo-data'

const parseHiredAt = (value) => {
    const [d, m, y] = String(value).split('.').map(Number)

    return new Date(y, m - 1, d)
}

export default {
    name: 'PlaygroundApp',

    components: { DemoBlock },

    mixins: [FilterMixin],

    data() {
        const initialFilters = this.getInitialFilters()

        return {
            layoutStore,
            theme: getTheme(),
            page: 3,
            tooltipOpen: false,
            notificationTab: 'all',

            // FilterMixin
            draftFilters: { ...initialFilters },
            appliedFilters: { ...initialFilters },
            filterStorageKey: 'kancelarko-ui:playground-filters',
            filterSerializer: (f) => ({ ...f, hiredFrom: f.hiredFrom instanceof Date ? f.hiredFrom.toISOString() : null }),
            filterDeserializer: (f) => ({ ...f, hiredFrom: f.hiredFrom ? new Date(f.hiredFrom) : null }),
            filterLabels: { department: 'Sektor', onlyActive: 'Samo aktivni', hiredFrom: 'Zaposlen od' },
            filterFormatters: { hiredFrom: (d) => toKancelarkoDateFormat(d) },

            componentIndex: [
                { name: 'KLayout.vue' }, { name: 'KSidebar.vue' }, { name: 'KSidebarItem.vue' }, { name: 'KSidebarChildItem.vue' },
                { name: 'KHeader.vue' }, { name: 'KHeaderModal.vue' }, { name: 'KNotificationRow.vue' }, { name: 'KPageSection.vue' },
                { name: 'KIcon.vue' },
                { name: 'KTextInput.vue' }, { name: 'KTextarea.vue' }, { name: 'KNumberInput.vue' }, { name: 'KCheckbox.vue' }, { name: 'KRadio.vue' }, { name: 'KSwitch.vue' },
                { name: 'KSelect.vue' }, { name: 'KSelectAsync.vue' }, { name: 'KEmployeeSelect.vue' }, { name: 'KDatePicker.vue' }, { name: 'KTextEditor.vue' },
                { name: 'KFileUpload.vue' }, { name: 'KDocumentUpload.vue' }, { name: 'KDocumentUploadMulti.vue' },
                { name: 'KAvatar.vue' }, { name: 'KTooltip.vue' }, { name: 'KInfoBox.vue' }, { name: 'KDataCard.vue' }, { name: 'KEmployeeCard.vue' }, { name: 'KPagination.vue' }, { name: 'KContextMenu.vue' },
                { name: 'KFilterPanel.vue' }, { name: 'KFilterPreview.vue' }, { name: 'KDataTable.vue' }, { name: 'KDataTablePrint.vue' },
                { name: 'KTree.vue' }, { name: 'KTreeNode.vue' },
                { name: 'KCalendar.vue' }, { name: 'KCalendarEvent.vue' },
            ],

            user: {
                fullName: 'Petar Petrović',
                email: 'petar.petrovic@paragraf.rs',
                avatar: '',
            },
            form: {
                name: '',
                email: 'pogresan-email',
                phone: '+381',
                digits: '',
                amount: 10,
                days: 31,
                comment: '',
                comment2: 'Tekst sa greškom',
                city: null,
                cityValue: null,
                tags: [],
                asyncCity: null,
                asyncCities: [],
                employee: null,
                employees: [],
                date: null,
                time: null,
                datetime: null,
                month: null,
                year: null,
                agree: false,
                yesNo: 'NE',
                fruits: ['jabuka'],
                gender: 'm',
                notifications: true,
                darkMode: getTheme() === 'dark',
                file: null,
                file2: null,
                html: '<p>Zdravo <b>Kancelarko</b>!</p>',
            },
            docs: {
                single: null,
                pending: [],
                saved: [
                    { ID: 1, fileName: 'ugovor-o-radu.pdf', fileSize: 22645, uploadTime: '2026-05-11 14:06:13' },
                    { ID: 2, fileName: 'aneks-1.pdf', fileSize: 10240, uploadTime: '2026-06-02 09:10:00' },
                ],
            },
            cities: [
                { value: 'bg', label: 'Beograd' },
                { value: 'ns', label: 'Novi Sad' },
                { value: 'ni', label: 'Niš' },
                { value: 'kg', label: 'Kragujevac' },
                { value: 'su', label: 'Subotica' },
            ],
            employeeOptions,
            departments,
            employeeCard: { fullName: 'Petar Petrović', avatar: '', wpPath: 'Paragraf d.o.o., Razvoj, Petar Petrović' },
            employeeWorkTimes: [{ od: '2026-10-19 08:00:00', do: '2026-10-19 16:00:00' }],
            dataCardRows: [
                { key: 'adresa', label: 'Adresa', value: 'Bulevar kralja Aleksandra 1' },
                { key: 'grad', label: 'Grad', value: 'Beograd' },
                { key: 'tip', label: 'Tip adrese', value: 'Prebivalište' },
            ],
            apps: [
                { icon: 'module-icons/e-fiskalna-kasa', label: 'e-Fiskalna kasa' },
                { icon: 'module-icons/e-obrasci', label: 'e-Obrasci' },
                { icon: 'module-icons/e-otpremnice', label: 'e-Otpremnice' },
                { icon: 'module-icons/e-tiketi', label: 'e-Tiketi' },
                { icon: 'module-icons/troskovnik', label: 'Troškovnik' },
            ],
            notifications: [
                { id: 1, icon: 'circle-icons/holiday-request', title: 'Zahtev za odmor', text: 'Marko Marković je poslao <b>zahtev za godišnji odmor</b>.', time: 'pre 5 min', unread: true, link: '/odsustva/zahtevi' },
                { id: 2, icon: 'circle-icons/birthday', title: 'Rođendan', text: 'Jovana Jovanović danas slavi rođendan.', time: 'danas', unread: true, link: '' },
                { id: 3, icon: 'circle-icons/invoice', title: 'Faktura', text: 'Nova faktura je evidentirana.', time: 'juče', unread: false, link: '/fakture' },
            ],
            documents: [
                { id: 1, name: 'Ugovor o radu - M. Marković.pdf', date: '12.10.2026', time: '09:41' },
                { id: 2, name: 'Rešenje o GO 2026.pdf', date: '08.10.2026', time: '14:02' },
            ],
            table: { perPage: 5, search: '' },
            perPageOptions: [
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
            ],
            tableColumns: [
                { data: 'name', title: 'Ime i prezime', name: 'name' },
                { data: 'email', title: 'Email', name: 'email' },
                { data: 'department', title: 'Sektor', name: 'department' },
                { data: 'hiredAt', title: 'Datum zaposlenja', name: 'hiredAt' },
                { data: null, title: 'Status', name: 'status', orderable: false, defaultContent: '' },
                { data: null, title: 'Akcije', name: 'actions', orderable: false, searchable: false, width: '15%', defaultContent: '' },
            ],
            printColumns: [
                { key: 'name', label: 'Ime i prezime' },
                { key: 'email', label: 'Email' },
                { key: 'department', label: 'Sektor' },
                { key: 'hiredAt', label: 'Datum zaposlenja' },
                { key: 'active', label: 'Aktivan' },
            ],
            employees,
            treeNodeSelected: [],
            treeData: [
                {
                    id: '1', label: 'Paragraf d.o.o.', icon: 'company', children: [
                        { id: '2', label: 'Razvoj', icon: 'sector', children: [
                            { id: '3', label: 'Petar Petrović', icon: 'profile-without-circle' },
                            { id: '4', label: 'Jovana Jovanović', icon: 'profile-without-circle' },
                        ] },
                        { id: '5', label: 'Prodaja', icon: 'sector', children: [
                            { id: '6', label: 'Marko Marković', icon: 'profile-without-circle', disabled: true },
                            { id: '7', label: 'Nikola Nikolić', icon: 'profile-without-circle' },
                        ] },
                        { id: '8', label: 'Pravna služba', icon: 'sector', children: [
                            { id: '9', label: 'Ana Anić', icon: 'profile-without-circle' },
                        ] },
                    ],
                },
            ],
            calendarEvents: [
                { id: 'e1', title: 'Sastanak tima', start: '2026-10-19T10:00:00', end: '2026-10-19T11:00:00', extendedProps: { type: 'task' } },
                { id: 'e2', title: 'Rođendan – Jovana Jovanović', start: '2026-10-21', extendedProps: { type: 'birthday' } },
                { id: 'e3', title: 'Godišnji odmor – Marko Marković', start: '2026-10-22', end: '2026-10-25', extendedProps: { type: 'holiday' } },
                { id: 'e4', title: 'Beleška: poslati izveštaj', start: '2026-10-27', extendedProps: { type: 'note' } },
                { id: 'e5', title: 'Istek ugovora – Ana Anić', start: '2026-10-29', extendedProps: { type: 'kadrovik' } },
                { id: 'e6', title: 'Podsetnik: faktura', start: '2026-10-30T14:00:00', extendedProps: { type: 'reminder' } },
                { id: 'e7', title: 'Slava', start: '2026-11-08', extendedProps: { type: 'slava' } },
            ],
        }
    },

    computed: {
        filteredEmployees() {
            const q = this.table.search.trim().toLowerCase()
            const f = this.appliedFilters || {}

            return this.employees.filter((e) => {
                if (q && ![e.name, e.email, e.department].some((v) => v.toLowerCase().includes(q))) return false
                if (f.department && e.department !== f.department) return false
                if (f.onlyActive && !e.active) return false
                if (f.hiredFrom instanceof Date && parseHiredAt(e.hiredAt) < f.hiredFrom) return false

                return true
            })
        },

        visibleNotifications() {
            return this.notificationTab === 'unread'
                ? this.notifications.filter((n) => n.unread)
                : this.notifications
        },

        sidebarItems() {
            return [
                { icon: 'calendar', label: 'Kalendar', color: 'yellow-icon', url: '/kalendar' },
                { icon: 'user-hub', label: 'Moj nalog', color: 'blue-icon', url: '/moj-nalog' },
                { icon: 'list-of-obligation', label: 'HR spisak obaveza', color: 'light-violet-icon', url: '/hr-spisak-obaveza' },
                {
                    icon: 'organisation', label: 'Interna organizacija', color: 'peach-icon',
                    children: [
                        { label: 'Zaposleni / angažovani', url: '/interna-organizacija/zaposleni-angazovani', activeUrls: ['/interna-organizacija/zaposleni', '/notes'] },
                        { label: 'Radna mesta', url: '/interna-organizacija/radna-mesta' },
                        { label: 'Organizacione jedinice', url: '/interna-organizacija/organizacione-jedinice' },
                    ],
                },
                { icon: 'notice-board', label: 'Oglasna tabla', color: 'violet-icon', url: '/oglasna-tabla' },
                {
                    icon: 'employee', label: 'Dnevna evidencija rada', color: 'green-icon',
                    children: [
                        { label: 'Nerešeni izostanci', url: '/dnevna-evidencija-rada/nereseni-izostanci' },
                        { label: 'Evidencija prisutnosti', url: '/dnevna-evidencija-rada/evidencija-prisutnosti' },
                    ],
                },
                { icon: 'hours', label: 'Ostvareni sati rada', color: 'lilac-icon', url: '/ostvareni-sati-rada' },
                { icon: 'report', label: 'Izveštaji', color: 'light-blue-icon', children: [{ label: 'Odsustva', url: '/izvestaji/odsustva' }, { label: 'Pauze', url: '/izvestaji/pauze' }] },
                {
                    icon: 'organisation-of-working-hours', label: 'Organizacija radnog vremena', color: 'orange-icon',
                    children: [
                        { label: 'Redovno radno vreme', url: '/organizacija-radnog-vremena/redovna' },
                        { label: 'Trenutno radno vreme', url: '/organizacija-radnog-vremena/trenutno-radno-vreme' },
                    ],
                },
                {
                    icon: 'absence', label: 'Odsustva', color: 'pink-icon',
                    children: [
                        { label: 'Zahtevi', url: '/odsustva/zahtevi' },
                        { label: 'Rešenja', url: '/odsustva/resenja' },
                        {
                            label: 'Masovne akcije', url: 'javascript:void(0)',
                            children: [
                                { label: 'Utvrđivanje GO', url: '/odsustva/masovne-akcije/utvrdjivanje-go' },
                            ],
                        },
                    ],
                },
                { icon: 'contract', label: 'Ugovori', color: 'mint-icon', url: '/ugovori' },
                { icon: 'benefits', label: 'Komponente (aktivna)', color: 'kiwi-icon', url: '/komponente' },
                { icon: 'forum', label: 'Forum', color: 'dark-blue-icon', url: '/forum', children: [{ label: 'Kategorije', url: '/forum' }, { label: 'Omiljene objave', url: '/forum/omiljene-objave' }] },
                { icon: 'adress-book', label: 'Adresar', color: 'red-icon', url: '/adresar', target: '_blank' },
                { separator: true },
                { icon: 'change', label: 'Promena modula', color: 'blue-icon', url: 'javascript:void(0)', onClick: (e) => { e.preventDefault(); this.$toast.info('Promena modula') } },
                { icon: 'settings', label: 'Podešavanja', color: 'blue-icon', children: [{ label: 'Opšta podešavanja', url: '/podesavanja/opsta-podesavanja' }, { label: 'Nadzornici', url: '/podesavanja/nadzornici' }] },
                { icon: 'contact', label: 'Kontakt', color: 'blue-icon', url: 'javascript:void(0)', onClick: (e) => { e.preventDefault(); this.showAlert() } },
                { separator: true },
                { icon: 'sign-out', label: 'Izlaz iz naloga', color: 'blue-icon', url: '/odjava' },
            ]
        },

        headerActions() {
            return [
                { id: 'gold', icon: 'kancelarko-gold', tooltip: 'Gold paket', href: 'https://kancelarko.rs/gold-paket', target: '_blank' },
                { id: 'ai', icon: 'paragraf-ai', tooltip: 'Paragraf AI', href: 'https://www.paragraf.rs', target: '_blank' },
                { id: 'webinars', icon: 'webinars', tooltip: 'Webinari', href: 'https://www.paragraf.rs', target: '_blank' },
                { id: 'discount', icon: 'discount', tooltip: 'Popusti', href: 'https://www.paragraf.rs/partneri/nasi-partneri.html', target: '_blank' },
                { id: 'instructions', icon: 'instructions', tooltip: 'Stručni tekstovi (nedostupno)', disabled: true },
                { id: 'documents', icon: 'last-file', tooltip: 'PK dokumenti', modalId: 'last-used-documents-modal' },
                { id: 'mail', icon: 'mail', tooltip: 'Kancelarko poruke', onClick: () => this.$toast.info('Kancelarko poruke') },
                { id: 'apps', icon: 'apps', tooltip: 'Aplikacije', modalId: 'additional-applications-modal' },
                { id: 'notifications', icon: () => (this.notifications.some((n) => n.unread) ? 'notification-active' : 'notification'), tooltip: 'Notifikacije', modalId: 'notifications-modal' },
                { id: 'theme', icon: () => (this.theme === 'dark' ? 'light-theme' : 'dark-theme'), tooltip: 'Promeni temu', onClick: () => this.toggleTheme() },
            ]
        },
    },

    mounted() {
        this.stopThemeListener = onThemeChange((theme) => {
            this.theme = theme
            this.form.darkMode = theme === 'dark'
        })
    },

    beforeUnmount() {
        if (this.stopThemeListener) this.stopThemeListener()
    },

    methods: {
        /* FilterMixin ocekuje ovu metodu */
        getInitialFilters() {
            return { department: null, onlyActive: false, hiredFrom: null }
        },

        toggleTheme() {
            toggleTheme({ persist: true })
        },

        onDarkModeSwitch({ checked }) {
            if ((getTheme() === 'dark') !== checked) {
                toggleTheme({ persist: true })
            }
        },

        onSidebarItemClick({ item, event }) {
            if (item?.url && item.url !== 'javascript:void(0)') {
                // u demo-u ne navigiramo
                event?.preventDefault?.()
                this.$toast.info('Navigacija: ' + item.url)
            }
        },

        onHeaderAction({ action }) {
            console.log('header action', action.id)
        },

        onPerPageChange(value) {
            this.$refs.employeesTable?.setPageLength(Number(value) || 5)
        },

        markAllRead() {
            this.notifications.forEach((n) => { n.unread = false })
        },

        onTreeSelect(selected) {
            console.log('tree selected', selected)
        },

        onTreeNodeSelect(event) {
            const ids = Array.isArray(event?.ids) ? event.ids : [event?.id]

            ids.filter(Boolean).forEach((id) => {
                const idx = this.treeNodeSelected.indexOf(id)

                if (event.selected && idx === -1) this.treeNodeSelected.push(id)
                if (!event.selected && idx !== -1) this.treeNodeSelected.splice(idx, 1)
            })
        },

        onCalendarEventClick(arg) {
            this.$toast.info('event-click: ' + (arg?.event?.title ?? arg?.title ?? ''))
        },

        onCalendarDateClick(arg) {
            this.$toast.info('date-click: ' + (arg?.dateStr ?? arg?.date ?? ''))
        },

        normalizeFiles(payload) {
            if (!payload) return []
            if (payload instanceof File) return [payload]
            if (typeof payload.length === 'number') return Array.from(payload)
            if (payload.file) return [payload.file]

            return [payload]
        },

        onDocumentSelect(payload) {
            this.docs.single = this.normalizeFiles(payload)[0] ?? null
        },

        onMultiSelect(payload) {
            this.docs.pending.push(...this.normalizeFiles(payload))
        },

        async resolveCities(query) {
            await new Promise((r) => setTimeout(r, 300))
            const q = String(query || '').toLowerCase()

            return this.cities.filter((c) => c.label.toLowerCase().includes(q))
        },

        showToast() {
            this.$toast.success('Sačuvano!')
            this.$toast({
                title: { text: 'Nova notifikacija', isLink: true, url: '/odsustva/zahtevi' },
                body: 'Marko Marković je poslao <b>zahtev</b> za odmor.',
                icon: 'circle-icons/holiday-request',
                autoClose: 6000,
            })
        },

        async showAlert() {
            const result = await this.$alert.confirm({
                title: 'Da li ste sigurni?',
                text: 'Ova akcija se ne može poništiti.',
                confirmText: 'Potvrdi',
                cancelText: 'Otkaži',
            })

            if (result.isConfirmed) {
                this.$alert.success('Uspešno', 'Akcija je izvršena.')
            }
        },
    },
}
</script>
