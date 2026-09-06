// ── Materiale didattico: elenco statico importato dall'indice del Drive
// (Presentazioni, Educazione civica, CLIL, Approfondimenti, Progetti
// interdisciplinari) — sola lettura, i file restano su Drive: qui c'è solo
// il link. Categoria/Materia/Argomento derivati dalla struttura di cartelle
// dell'indice originale, non dal contenuto dei documenti.
const MATERIALE_LIST = [
  {
    "id": "m2donig",
    "titolo": "Leggere i grafici finanziari",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Leggere i grafici finanziari",
    "link": "https://drive.google.com/file/d/1__BV9CpWVSoOP3ho6mv15escLLVtcrBv/view?usp=drivesdk"
  },
  {
    "id": "m1oc05qd",
    "titolo": "Inflazione",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Inflazione",
    "link": "https://drive.google.com/file/d/1xQhj33u-t6YQ-dKXI_ylwi-gt3oITnVY/view?usp=drivesdk"
  },
  {
    "id": "m1j4mbu3",
    "titolo": "Democrazia e sistemi elettorali",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Democrazia e sistemi elettorali",
    "link": "https://drive.google.com/file/d/1gxRk_tKcsEBkoqjBQjpK0Jjim54c01Ev/view?usp=drivesdk"
  },
  {
    "id": "m14tlt77",
    "titolo": "Ridurre le disuguaglianze - Aliquote e percentuali",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Ridurre le disuguaglianze - Aliquote e percentuali",
    "link": "https://drive.google.com/file/d/1Lq6ZdwEmTvcfX_0abiD685YDsPJyNlom/view?usp=drivesdk"
  },
  {
    "id": "mzydsti",
    "titolo": "Le tasse e il cambiamento climatico",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Le tasse e il cambiamento climatico",
    "link": "https://docs.google.com/document/d/1bDyB9Kg5pp1Lcp74MdtFOVTmEvsdPwA83Sl7lrUCfTA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mnn73u5",
    "titolo": "Pannelli solari",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Pannelli solari",
    "link": "https://docs.google.com/document/d/1y58cBX9HNewJaQXs2T9rbUwcGu9l6hRmTVivUWd27K0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m7me4mc",
    "titolo": "Motore elettrico",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Motore elettrico",
    "link": "https://docs.google.com/document/d/11PCIqCkHqmMizTocDAEDMOxTMX_3VdVhhpiWoN_yi3I/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m14840gm",
    "titolo": "Sviluppo sostenibile",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Sviluppo sostenibile",
    "link": "https://docs.google.com/document/d/1rYUGsBplQdxpGi90mixwlNsyuY3vo_CkVSxCPRcTupk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mimxyzx",
    "titolo": "Un click per la scuola",
    "categoria": "Educazione civica",
    "materia": "",
    "argomento": "Un click per la scuola",
    "link": "https://docs.google.com/document/d/1IXhtGtca7pGwUTLpr0JlY7h2jF19OPFIXCBj9TjJe10/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1xmqesi",
    "titolo": "La verità",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "La verità",
    "link": "https://docs.google.com/document/d/10fZlas51XeU4k0BVQTw6IOlNFN6eOf-xm-tSaPpHJXQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mka0mt1",
    "titolo": "Problem solving",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Problem solving",
    "link": "https://docs.google.com/presentation/d/1Z6t_cJgrQoKXN9mcPsham9RuWJDwh7wXZt-d_zf7X7M/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1uerroz",
    "titolo": "Testo argomentativo sulla fisica dell'800",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Testo argomentativo sulla fisica dell'800",
    "link": "https://docs.google.com/document/d/1qiUPE5oj-se5kZfMrfwY4h-45mO_L3xWHdYYPZP1g4k/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mlf161v",
    "titolo": "Ore stellari",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Ore stellari",
    "link": "https://docs.google.com/presentation/d/1eHJsgkvqgddLUe6-ogcGNxxPHn8T5JHroo7N_kmiFUA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2i0d29",
    "titolo": "Elementi - Elementari",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Elementi - Elementari",
    "link": "https://docs.google.com/presentation/d/1ZgdTT0VNRnWQOI86cH_MIm9Y1cxQUNnu6Km4GhjoSi8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m15iuq5",
    "titolo": "Anche i fisici sono filsofi",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Anche i fisici sono filsofi",
    "link": "https://drive.google.com/file/d/1OrpsIYZ67CI0-bb1-XkLjLvfo2QxuBnT/view?usp=drivesdk"
  },
  {
    "id": "mtgcj6f",
    "titolo": "Coniche",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Coniche",
    "link": "https://docs.google.com/document/d/17fc-U8X40vPIvTU8t5qxuOpmab_6kioC2cxSuVCWy2E/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1o3uo29",
    "titolo": "La Fisica dell'Inferno dantesco",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "La Fisica dell'Inferno dantesco",
    "link": "https://docs.google.com/document/d/1FKtO8pgHAk93wtS0DoKWePFbIHyhOQnwJdeO6S12G4M/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mz7yein",
    "titolo": "Un click per la scuola",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Un click per la scuola",
    "link": "https://docs.google.com/presentation/d/1J5DEwl1tEjAldbmrwjCoBal-KhkuPFrCQnEWeHy19-c/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m4gib60",
    "titolo": "Anche i fisici sono filsofi",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Anche i fisici sono filsofi",
    "link": "https://docs.google.com/document/d/10xCrsoqsNqsVW8zZc-Ls3-OxEpEGRIC_laz_kdwDYyI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mdajja7",
    "titolo": "Tempo",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Tempo",
    "link": "https://docs.google.com/presentation/d/1TA2sa5f2-vRpmPbnlOATBGlyf-J6bXj4xZ4rgdshIhQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1yfdfco",
    "titolo": "La Fisica dell'Inferno dantesco",
    "categoria": "Progetti interdisciplinari",
    "materia": "",
    "argomento": "Inferno di Dante",
    "link": "https://docs.google.com/presentation/d/1dBaEOpJ6jy9kVTfuaOPKxp69BrPhogdWGJZkjrN0hUg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ylkvpu",
    "titolo": "Matematici in guerra",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Matematici in guerra",
    "link": "https://docs.google.com/document/d/1xpZsdHJBPyMWa5wHsalhVCMPvLEMTpgzp8fNulsW6D4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1g2myko",
    "titolo": "Numeri",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Numeri",
    "link": "https://docs.google.com/document/d/1jqsLzRCiv3ybtKxxXXea_zqrSh-zoXOjrA8V7EdK5ZY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mdy6cn",
    "titolo": "Numeri",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Numeri",
    "link": "https://docs.google.com/document/d/1UZjvVf-_aJfffQIdhmBLbsvjMnp0-DB2OBBNogDd3uQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mnurylq",
    "titolo": "TAN E TAEG",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "TAN E TAEG",
    "link": "https://docs.google.com/document/d/1olK_F2vaIACPVMyNWWaHLlff_XgwBIGXmgkgGnUpaVA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mfix4oa",
    "titolo": "Il piano cartesiano nella storia",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Il piano cartesiano nella storia",
    "link": "https://docs.google.com/document/d/1UF2VqK_dhMctENyXmtEBQ1wIXG62FHCh8nlVF1sb_wc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mscvvj2",
    "titolo": "Teoremi triangoli rettangoli",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1B2PHM4dVRi-jIaQIdNHA7EdltMi7RujW/view?usp=drivesdk"
  },
  {
    "id": "m1mubzql",
    "titolo": "Teoremi triangoli qualsiasi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1pC_uPiGdWBShHBNavjPMLeGWrJMXGSHW/view?usp=drivesdk"
  },
  {
    "id": "msrlgt2",
    "titolo": "Funzioni goniometriche relazioni fondamentali",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1-s1p2ihgXh0fmlXRk9vgH3O7wWi4X2so/view?usp=drivesdk"
  },
  {
    "id": "ml1lq2m",
    "titolo": "Formule trigonometria",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1F392dkPlGPa4dezlduxTx4CmV-sPdgcv/view?usp=drivesdk"
  },
  {
    "id": "m1k1eiof",
    "titolo": "Area triangolo",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1mdBvGj_ink4tMPF3fm5WARGukI1kxmD0/view?usp=drivesdk"
  },
  {
    "id": "m1hiqteb",
    "titolo": "Funzioni goniometriche definizioni proprieta",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1yll77mNBMnHoK1eu7-yELCzU1V5GBfd9/view?usp=drivesdk"
  },
  {
    "id": "m17dhy04",
    "titolo": "Scomposizioni",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/17pfPOieNrmfIoikrIvXw6c6oKCi1AZJu/view?usp=drivesdk"
  },
  {
    "id": "m3g3sth",
    "titolo": "Numeri complessi approfondimento",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1TPYACHh6IyFfKPaxXxNFTplcFokDYuEu/view?usp=drivesdk"
  },
  {
    "id": "m1x0uxit",
    "titolo": "Logaritmi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1ev2HDRcp2K23gSI84XDAic_AuU4AMR2x/view?usp=drivesdk"
  },
  {
    "id": "m1k7cclj",
    "titolo": "Formule goniometriche",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1omXRkF0qtvQ71aG8niEY8BxO9T1yrWlU/view?usp=drivesdk"
  },
  {
    "id": "m18219qk",
    "titolo": "Angoli misura conversioni",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1-CHn6hz0gqnnFLz2QyyjHawQrspnSkPD/view?usp=drivesdk"
  },
  {
    "id": "mo6ykub",
    "titolo": "Angoli associati",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1JjDQ9bUpCTJiqGoSa8sE5QLPICrl7GOA/view?usp=drivesdk"
  },
  {
    "id": "m10r04og",
    "titolo": "Circonferenza",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1Usj_s8l863RcJX2Q0nHXtDFxHK15XkcA/view?usp=drivesdk"
  },
  {
    "id": "m18kot9k",
    "titolo": "Proporzioni",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1_4BZt2Ob2Evu5v5lGXYCQ9TU55AV0R3o/view?usp=drivesdk"
  },
  {
    "id": "mfxhfu4",
    "titolo": "Progressioni",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1JcS9k0QcnUlIa4BNoTCh_MKNv-f-DkFP/view?usp=drivesdk"
  },
  {
    "id": "m1efdjjt",
    "titolo": "Punti di non derivabilità",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1xiEfQ4EbDro01JqcbLk3WIIDzRweckYP/view?usp=drivesdk"
  },
  {
    "id": "m19kcdh5",
    "titolo": "Definizione ricerca massimi minimi assoluti",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/11m7GC7m_-63Yn4oM9GvVECGsSnjsm0-y/view?usp=drivesdk"
  },
  {
    "id": "mfxvuub",
    "titolo": "Derivate",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1qzbPg6F_WlPNeNt9CpOawVWIjT_HOI4Q/view?usp=drivesdk"
  },
  {
    "id": "m1ehdllh",
    "titolo": "Studio grafico funzione",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1BIe1KE479-bMYcVOqWj5dZdgE3VJm3N6/view?usp=drivesdk"
  },
  {
    "id": "mrkzvye",
    "titolo": "Ricerca diretta max min flesso",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1sVDyamE-YygQWffczODZMQ7n5ddFbRSG/view?usp=drivesdk"
  },
  {
    "id": "m1sbk1uf",
    "titolo": "Formula equazione secondo grado",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1k2ITbex9fDk2dZZz9xIAJaSJ75-D6XWx/view?usp=drivesdk"
  },
  {
    "id": "mfwcimw",
    "titolo": "Formulario completo",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1U3jkrPAVixWwx0yQqIYu3d3BvcdfWrLL/view?usp=drivesdk"
  },
  {
    "id": "m1phjq4z",
    "titolo": "Disequazioni irrazionali",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1CVGMZzrh6x3D6CruNAHWAU85sYdjl5JZ/view?usp=drivesdk"
  },
  {
    "id": "m1dw0ac0",
    "titolo": "Equazioni disequazioni binomie biquadratiche",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1Ke1rMhm7gzJIRTrIorQi0RTv_L8k0R1L/view?usp=drivesdk"
  },
  {
    "id": "m19guatw",
    "titolo": "Prodotti notevoli",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/125w6X3P8QGO49zqwWjhN7XBbFfleso7l/view?usp=drivesdk"
  },
  {
    "id": "m14k4677",
    "titolo": "Equazioni secondo grado",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1p_r0JLNlOGRtBwml_Za_MGoQ3e8oBXDO/view?usp=drivesdk"
  },
  {
    "id": "m1x0o4fv",
    "titolo": "Disequazioni valore assoluto",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1eev0PJJttkXAuM-w7U1FZPbMER1CUUSR/view?usp=drivesdk"
  },
  {
    "id": "m8g9nnu",
    "titolo": "Volumi superfici figure solide",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1-jNvu5CWIwcwQEs9zDlWqh86NK9MDAOc/view?usp=drivesdk"
  },
  {
    "id": "m1fr9r5n",
    "titolo": "Integrali indefiniti",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/12vNtFvX4LgnS6SWVoG9HO_YJEAUEIrN1/view?usp=drivesdk"
  },
  {
    "id": "my38r43",
    "titolo": "Definizione integrale indefinito",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1HbQjaHDELcSRBCL5fHICut95CBrogA7I/view?usp=drivesdk"
  },
  {
    "id": "mlzkzjn",
    "titolo": "Teorema di derivabilita continuita",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1qwlzal-wTy1GuZSwK-mkmu7MQKmhKkOy/view?usp=drivesdk"
  },
  {
    "id": "m1olri3b",
    "titolo": "Esempi studio grafico funzione",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1TqZcD8DDLdVN0HVPtaLpLFK0iacJqz7Q/view?usp=drivesdk"
  },
  {
    "id": "m1n0zzvd",
    "titolo": "Definizione monotonia massimi minimi relativi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1yFNzxnb_AyhzwRB3hp8gkn1l7VPysvdR/view?usp=drivesdk"
  },
  {
    "id": "m1qb4f4u",
    "titolo": "Calcolo limiti",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1oSdkTL1tlWw2LAVAe7vDfIjUpSYl74gO/view?usp=drivesdk"
  },
  {
    "id": "msm7uh0",
    "titolo": "Limiti notevoli",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1FudwijEqEzNnDh29s3VXMgWcAxnHNeq-/view?usp=drivesdk"
  },
  {
    "id": "m1kil9jy",
    "titolo": "Limiti funzioni elementari",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1d_HzmEQh9wjdhJeiUZwnLhc_tbGPQdwt/view?usp=drivesdk"
  },
  {
    "id": "m11ixjra",
    "titolo": "Definizione limite",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1j5-oSvxlT38b1mPEzTAhQn4Kgz4dnTYz/view?usp=drivesdk"
  },
  {
    "id": "m1fs7lhn",
    "titolo": "Triangoli rettangoli particolari",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1z9bOn46Q4e3cb_4aUbdREJ5C1PvnOFvD/view?usp=drivesdk"
  },
  {
    "id": "m1rrwxtg",
    "titolo": "Parabola",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/12fuazrtwpRSxDwTkvFt1FBQ6QvoF8BYd/view?usp=drivesdk"
  },
  {
    "id": "mwz03y7",
    "titolo": "Elementi logica proposizioni",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1RfuGEXZEFAM9pAOrSTIZb8xB2i-WvxQs/view?usp=drivesdk"
  },
  {
    "id": "m1yiowul",
    "titolo": "Algebra dei limiti",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1FebEXDPP8Ehhue2RVP64SAXJrK_Ea00C/view?usp=drivesdk"
  },
  {
    "id": "mb4mwki",
    "titolo": "Simbologia",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1QSreAXU3wQ8-s5J9OjXYYm7cK8-5BBPn/view?usp=drivesdk"
  },
  {
    "id": "mpgixz0",
    "titolo": "Posizione angoli su circonferenza goniometrica",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1QAUZXt7WyBi-SwtWZGBW4utkatpHFgCk/view?usp=drivesdk"
  },
  {
    "id": "m32q5gt",
    "titolo": "Definizione concavita flessi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1JdUwVQTzbP4_L6Fje3wYvUuGFDNXwiin/view?usp=drivesdk"
  },
  {
    "id": "mwhpycg",
    "titolo": "Ellisse",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1JrmnUkSb5BnbDUxXRXamUEnhDSsGJn_s/view?usp=drivesdk"
  },
  {
    "id": "m19aj6st",
    "titolo": "Definizione continuita punti discontinuita",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1TahvwGZO9FpOXvajqlvq_qEkLcNyNhLs/view?usp=drivesdk"
  },
  {
    "id": "mxpncvp",
    "titolo": "Scomposizione con Ruffini",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1NOA0PiHPxje1o3TU9dQLKcpMW_nJoeWZ/view?usp=drivesdk"
  },
  {
    "id": "m1nqxb2j",
    "titolo": "Scomposizione con divisione",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1WLSao3okfOf0wa9FakxIes_DHDvlRf12/view?usp=drivesdk"
  },
  {
    "id": "m1afgtkv",
    "titolo": "Numeri complessi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/13UK2X3toMxwsqKQlDMfpMevJlbNJy9u_/view?usp=drivesdk"
  },
  {
    "id": "m1u7qkh1",
    "titolo": "Calcolo combinatorio",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1jRgVUI5fOxAvacajNiHZNqEYnSdX-hTs/view?usp=drivesdk"
  },
  {
    "id": "mkoo9yl",
    "titolo": "Funzioni definizione tipi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1trcqXRyAV_6fe-Hq8KMx70go7vpiPb69/view?usp=drivesdk"
  },
  {
    "id": "m1fd7qfp",
    "titolo": "Terminologia",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1pORu_xZ-lE7bl-XAidViqilwQ70lLNy4/view?usp=drivesdk"
  },
  {
    "id": "m1ad8j2h",
    "titolo": "Teoremi analisi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1v33P2Cw2WKXj5jP2fBYQ0HN9PktKSdnQ/view?usp=drivesdk"
  },
  {
    "id": "m15m5gx",
    "titolo": "Topologia retta",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1Z7NkmI71srDLEZ94V0V7L0WvyLjs6HDy/view?usp=drivesdk"
  },
  {
    "id": "m1d0qolr",
    "titolo": "Terzo teorema triangolo isoscele",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/17DyjUrzIX6UyfQi-XUW5WBxUuDRLQBD2/view?usp=drivesdk"
  },
  {
    "id": "m16fl9jf",
    "titolo": "Teoremi",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1JZS2Bl2a34zYjtxz5ekpPGElFiH4o_-I/view?usp=drivesdk"
  },
  {
    "id": "mytkh3l",
    "titolo": "Teorema sul triangolo isoscele",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/1iU9el7QwpOgEiPpAdlctIia7KqMobMJR/view?usp=drivesdk"
  },
  {
    "id": "m1ftgxr7",
    "titolo": "Teorema inverso sul parallelogramma",
    "categoria": "Approfondimenti",
    "materia": "Matematica",
    "argomento": "Formulario Matematica",
    "link": "https://drive.google.com/file/d/177kU7_P0_YIncONK0CTAnZ5Y4TdxzPm3/view?usp=drivesdk"
  },
  {
    "id": "m1qvs53n",
    "titolo": "Principali funzioni",
    "categoria": "Approfondimenti",
    "materia": "Informatica",
    "argomento": "Principali funzioni",
    "link": "https://docs.google.com/document/d/1wQ0Usykhw3aZ2I9p-aP2nRGSNIsMmYmZH0deVjXv2Cs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m14dtzeb",
    "titolo": "Sigle",
    "categoria": "Approfondimenti",
    "materia": "Informatica",
    "argomento": "Sigle",
    "link": "https://docs.google.com/document/d/1h6ZKZkDixb5zVcPLx86Kcd2NxDhEQOVJ64ovSwFoTsY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m17y6onf",
    "titolo": "Windows Essential",
    "categoria": "Approfondimenti",
    "materia": "Informatica",
    "argomento": "Windows Essential",
    "link": "https://docs.google.com/document/d/1bsTqt1vSa3YOlROGBLu77pmMgOaFKX_0YRf5PyJq6qg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1g0gd2r",
    "titolo": "Anche i fisici sono filosofi",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Anche i fisici sono filosofi",
    "link": "https://docs.google.com/document/d/1gu4wiUpwcaOOqhBEXu9ydQMSlqXnJO94L7CxL3s_0YQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1l0af4o",
    "titolo": "La Fisica è utile?",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "La Fisica è utile?",
    "link": "https://docs.google.com/document/d/10HSfTSKGiTPNqQtAo_wUHVnQgNaV_xWdm7pEgCs9aek/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mg4983s",
    "titolo": "Sistemi di unità di misura",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Sistemi di unità di misura",
    "link": "https://docs.google.com/document/d/1ikjLols8NkEDS_RFYYxGJZWUyO5YSae2_602xils8R8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1do9egf",
    "titolo": "Il nobel di Einstein",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Il nobel di Einstein",
    "link": "https://docs.google.com/document/d/18lE36U0bU-5rOtiawgUV0V3OsHmIa0qEFWCEj809sTI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m9sh4gm",
    "titolo": "Il valore della scienza",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Il valore della scienza",
    "link": "https://docs.google.com/document/d/1exEWmFT6xg19t5E2cnR_JoltgxH4L9pCKqfRTKeYdnY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mrb84m6",
    "titolo": "La fluidostatica",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "La fluidostatica",
    "link": "https://drive.google.com/file/d/1YO16fUfhlqUyPfUdLBydDkASlvZk6bx2/view?usp=drivesdk"
  },
  {
    "id": "mtojnw5",
    "titolo": "Campo",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Campo",
    "link": "https://docs.google.com/document/d/1qCF4Kso9cRC2A7UgMufmDebgq3peAmQeqVyI0Z-3Wv4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mk4v8yo",
    "titolo": "Le forze fondamentali",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Le forze fondamentali",
    "link": "https://docs.google.com/document/d/12YWlMBRBgHQ9kgGCkfakdMowzW4aTDGUjE0MF3NVqRo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1js45g6",
    "titolo": "Molecole",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Molecole",
    "link": "https://docs.google.com/document/d/1vfbzRvGaOX1PAuJKveorfRYXDCJjuqn8T8vlLaz8z6Y/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1xnblvu",
    "titolo": "La mole",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "La mole",
    "link": "https://docs.google.com/document/d/16BdQvZZuaZRpkW2hTp_zWPbYGryXCbYP8_BB_bNBRnI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ua0f07",
    "titolo": "Le trasformazioni termodinamiche",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Le trasformazioni termodinamiche",
    "link": "https://docs.google.com/document/d/1LhrWxZMIOSmgzpGyn9RfICpxjrYCaoKriVDPPmNXgAQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "ma05i23",
    "titolo": "Iceberg",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Iceberg",
    "link": "https://docs.google.com/document/d/1S9Szo3UWxsrWDvF1i76F4AIR11mr_IVAIcaxl_sSzV4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mbtift0",
    "titolo": "Luciano Folgore, L'Elettricità",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Luciano Folgore, L'Elettricità",
    "link": "https://docs.google.com/document/d/1Lv4qPAy6JbogpQEdZI5zdVufD2VC4m0TRr6x7NvGk3c/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m190o3yw",
    "titolo": "SI",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "SI",
    "link": "https://docs.google.com/document/d/1x32jr2o4l8MCwjOITR7BA8rKdp916mwXw_jTsajdO9I/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "masaax6",
    "titolo": "SI-Brochure-concise-EN",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "SI-Brochure-concise-EN",
    "link": "https://drive.google.com/file/d/1vPLICxE86o_hvDTn5N25kdEkNfyaSMTw/view?usp=drivesdk"
  },
  {
    "id": "mt73joi",
    "titolo": "Galileo e la peste",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Galileo e la peste",
    "link": "https://docs.google.com/document/d/1cBU7NFIJZHru0mivaDAzVIUg1ojXT0itJKJsoAqrpBw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1vw8cog",
    "titolo": "SI-Brochure-EN",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "SI-Brochure-EN",
    "link": "https://drive.google.com/file/d/1Uvt42jSfAbPKBFari1q5XQZ_rhgbbUJF/view?usp=drivesdk"
  },
  {
    "id": "m1iyv2pb",
    "titolo": "luce_rifrazione",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "luce_rifrazione",
    "link": "https://drive.google.com/file/d/1aHFiMBTKxEeolPKHua2zFZo7fZHzM0U4/view?usp=drivesdk"
  },
  {
    "id": "m1hsiv7t",
    "titolo": "luce_interferenza",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "luce_interferenza",
    "link": "https://drive.google.com/file/d/1K8Ctpp8VjXnHfiu-DR1RnyH1eZp0hX8Q/view?usp=drivesdk"
  },
  {
    "id": "m1dgytom",
    "titolo": "luce_dispersione",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "luce_dispersione",
    "link": "https://drive.google.com/file/d/1S00zXaJpKy25gAaHc0zOe907N4kuMTAb/view?usp=drivesdk"
  },
  {
    "id": "mu4ip9x",
    "titolo": "luce_colore",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "luce_colore",
    "link": "https://drive.google.com/file/d/1vjuzUCUfvJAfWsEf_3X3rMZVpujlzYdV/view?usp=drivesdk"
  },
  {
    "id": "mdqwro1",
    "titolo": "esame_ric_fis_pe",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Formulario Fisica",
    "link": "https://drive.google.com/file/d/1ofexTYPcAZY6N3Wblwbv2Ax_Unp3e9Z5/view?usp=drivesdk"
  },
  {
    "id": "m77g1z3",
    "titolo": "Infografiche - Fisica",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche",
    "link": "https://docs.google.com/presentation/d/1rIpSXGSpka23P0G5b-9G-QDht5-j4fgMZ1smSuLzRf8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1kqf1xj",
    "titolo": "mappa_fisica",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche",
    "link": "https://drive.google.com/file/d/1eXoMtw--sgf0WzjO7cd2z-eEaXjP0Zo_/view?usp=drivesdk"
  },
  {
    "id": "m1nnmefm",
    "titolo": "Calibro",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1zhIdjIAUahte_vtOwET4DU_fdb3OkVNf/view?usp=drivesdk"
  },
  {
    "id": "m1shytxn",
    "titolo": "Istogramma",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://docs.google.com/document/d/1rWJFkxighVNbqCIWeHMtssxNRTMk4oFGz3lu6aJ6znM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "meeu95q",
    "titolo": "Grafico a barre",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://docs.google.com/document/d/1SA-TzSjKFKlWoV6oFlSgUT4SqMbbOqGE8MYuXuLGM7I/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m116ugkv",
    "titolo": "Grafico a torta",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://docs.google.com/document/d/1YATG1UNKmx8AfpcMo_5kTONUEL8jKEc-Yw5V7gvg0i4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1jzbthu",
    "titolo": "inflazione",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/176n2fdzO0I-1G_9o_zUYXpoNnZFX6ku4/view?usp=drivesdk"
  },
  {
    "id": "mqna17p",
    "titolo": "infn_metastabilita",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/18_OEmO5ceUkL2qe5vrmNsKvhxE8Jwkrg/view?usp=drivesdk"
  },
  {
    "id": "md5ga0h",
    "titolo": "interferenza",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1V3lYk4mhgoZsxmY56AutbpfjI4vyfOSh/view?usp=drivesdk"
  },
  {
    "id": "mlxnblh",
    "titolo": "modello_standard",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1Jl3zQogeQOgAx9Pu-FnmfFoZL11ZxhGo/view?usp=drivesdk"
  },
  {
    "id": "m1b0y765",
    "titolo": "info_agata_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1wVN-OKclV7Pue8kb_kq2t35jnvsYxmYf/view?usp=drivesdk"
  },
  {
    "id": "m1ml5jea",
    "titolo": "info_formazionelnl_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1uLuKyoszcVmqiciFreDMBSqRDCsvIKHg/view?usp=drivesdk"
  },
  {
    "id": "m9i3crm",
    "titolo": "info_ams_missione_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1Ku-yg23kRJVnWJfGVCdVmvgCC_32tdC0/view?usp=drivesdk"
  },
  {
    "id": "m152coja",
    "titolo": "info_ams_scienza_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/15aNEjTsc8A9PKAxU3yiHvheEgC6hJqbs/view?usp=drivesdk"
  },
  {
    "id": "m1hp03mv",
    "titolo": "info_ams_strumento_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1GznnH_L4JH1ausQ4VOS9Xq_U9ayCZA0F/view?usp=drivesdk"
  },
  {
    "id": "mrix6qm",
    "titolo": "info_applicazionimateriali_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1nvIUNzLRxzQag52o_57WfNwnMVRUJR1z/view?usp=drivesdk"
  },
  {
    "id": "m1556tk3",
    "titolo": "info_arte_napoleone_2008",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1g38OQmjpenvvmtaigqm6Eu5IpdD8VQPs/view?usp=drivesdk"
  },
  {
    "id": "m1onrgob",
    "titolo": "info_beniculturali_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1DAdYvB41ZIV8JYRETNKXmm8ZwasZC2f1/view?usp=drivesdk"
  },
  {
    "id": "m1o7floi",
    "titolo": "info_borexino_solari",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1kg47KulNsUNHKeJCmtk3PP7xLFMbs9xr/view?usp=drivesdk"
  },
  {
    "id": "m10j6xee",
    "titolo": "info_borexino_geo",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1_EHNPEr3ZPdr20H8txiHJk_GZmDFAed8/view?usp=drivesdk"
  },
  {
    "id": "m1gdtwsn",
    "titolo": "info_borexino_sole_reale_ita",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/115b02xbfkzHxaVlXnexwvC3hdA6aXu16/view?usp=drivesdk"
  },
  {
    "id": "m1mdr41q",
    "titolo": "info_cnao_2014",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1bbEm41C3sAiYxFJ_opaA3453o0RK2NNw/view?usp=drivesdk"
  },
  {
    "id": "mizznmv",
    "titolo": "info_cngs_esperimento_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1ZK4jf2SiSbBQTC_bRjTGijFr0RDNJsOg/view?usp=drivesdk"
  },
  {
    "id": "m67c9p2",
    "titolo": "info_cngs_oscillazione_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1v2MXZORNTeq4yRnSBK-R36WLjv4kNECF/view?usp=drivesdk"
  },
  {
    "id": "m14dlb6p",
    "titolo": "Costituenti_elementari_della_materia_ottimizzato",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1_nx6XpdkvVOMUDfJj5KfGYH6odUSgn0K/view?usp=drivesdk"
  },
  {
    "id": "m1d97nms",
    "titolo": "info_darkside_2015",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1z34lbCs9DB71GiXDdYI-CgC5P4hZCCSK/view?usp=drivesdk"
  },
  {
    "id": "m1easwej",
    "titolo": "info_grid_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1tirpvsAFIhYHCW83gpoeQcaAs_FV4XFE/view?usp=drivesdk"
  },
  {
    "id": "mf14zzv",
    "titolo": "info_ifmif_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1GkbAHRzSyjunFfHp8zHrEuI2ZhiPMGHN/view?usp=drivesdk"
  },
  {
    "id": "mrwgxn",
    "titolo": "info_infn_2010",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1J1EDkDFnkQfn5ct871hMshrPPgWeO9Bl/view?usp=drivesdk"
  },
  {
    "id": "m1hj5kju",
    "titolo": "info_iter_2011",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1Ohr_vkfn6MyW4FVDdZK-n4yVCo3XFTB1/view?usp=drivesdk"
  },
  {
    "id": "m1oecrz1",
    "titolo": "info_capodogli_02",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1_s6lKF2i-52_HG1_ydQwueMoD78ydqrD/view?usp=drivesdk"
  },
  {
    "id": "mytv2sw",
    "titolo": "info_leger_2014",
    "categoria": "Approfondimenti",
    "materia": "Fisica",
    "argomento": "Infografiche / Fisica",
    "link": "https://drive.google.com/file/d/1OLYFZ_gA5NCK2Pu6Ee2bBtrkgY--jG4h/view?usp=drivesdk"
  },
  {
    "id": "mkodm83",
    "titolo": "How four equations made the modern world",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "How four equations made the modern world",
    "link": "https://docs.google.com/document/d/1QOOOIHPwMoIWFOjQcaDwBITBFpW_rdXNYrTiK8c-2Bw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "ms00s0y",
    "titolo": "History of Measurement - Imperial System vs. Metric System",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "History of Measurement - Imperial System vs. Metric System",
    "link": "https://drive.google.com/file/d/1ybY0PbZGSidiN85wJiP_y2xxZvHa6EDL/view?usp=drivesdk"
  },
  {
    "id": "m1n9vev4",
    "titolo": "Alternating current (eng)",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Alternating current (eng)",
    "link": "https://docs.google.com/presentation/d/18nYhhW5ZgISRGP-0e8s5PKEv_FdQ-mMSVb5uJmkv8Hk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m11ox6qp",
    "titolo": "Renewable energy",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Renewable energy",
    "link": "https://docs.google.com/document/d/1W4yGNz9gtw9QCzqx3BAD1Y1IIB1yTK8ZPs5TH286OK0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m13klev",
    "titolo": "Tesla vs Edison (eng)",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Tesla vs Edison (eng)",
    "link": "https://docs.google.com/presentation/d/1vXcFyDfeR2USeTkb6wMqaWBfr4B_o1i71PTQxDkB5Os/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1oznbg6",
    "titolo": "Einsteins-Szilàrd letter",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Einsteins-Szilàrd letter",
    "link": "https://docs.google.com/document/d/1VFySOgrxJFOCKI6C8SLrR8c9b1UhcPC0QrqAGXfT4RU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1btn1lw",
    "titolo": "The Manhattan project",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "The Manhattan project",
    "link": "https://docs.google.com/document/d/1TH07O06k-q-xj96wzm2y2h63fligiCVS4-5Q-R_2e74/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1djjdgt",
    "titolo": "Wave-Particle Duality",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Wave-Particle Duality",
    "link": "https://docs.google.com/document/d/1dJcwP65m-Ose2Pv4t8NXkmFSDy6hgTRvFNMrFVDg5Gc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2lkted",
    "titolo": "Edison vs Tesla (test)",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Edison vs Tesla (test)",
    "link": "https://docs.google.com/document/d/1sN1_Kme2lElc0sW6iDnJC5ihU81Ghk-I3nd-WAoDNI4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ljc0zl",
    "titolo": "Maxwell Equations",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Maxwell Equations",
    "link": "https://docs.google.com/document/d/1SSnMtZgJpGlmSOZvcygkjNIn65X2ddLSdYOG6L9b0Xo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mdmosr3",
    "titolo": "Fenomeni magnetici (eng)",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Fenomeni magnetici (eng)",
    "link": "https://docs.google.com/presentation/d/1agYMUy4ke-NYF_J5XgJZGkTBzGygjC5OXlUroxJeUIE/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m19bukzf",
    "titolo": "Relativity",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Relativity",
    "link": "https://docs.google.com/document/d/1FAEipmrWZPlnGyFK1OuP3aYprfChVjBlU4yXgzLGEEw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ptv6ai",
    "titolo": "Rocket Science (eng)",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Rocket Science (eng)",
    "link": "https://docs.google.com/presentation/d/1Ch3gMhKUD73Sh9kmkOQuVb6qB0rPxX5NfImmtOxrJEQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1k8fmnv",
    "titolo": "Entropy",
    "categoria": "CLIL",
    "materia": "",
    "argomento": "Entropy",
    "link": "https://docs.google.com/document/d/1aG-6ppGV2wW66z9ZCeHjpHgeveeXhsP5Rpyd0zwB5-o/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1w0yupn",
    "titolo": "[Fisica] [CLIL] - Gravitation",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "[Fisica] [CLIL] - Gravitation",
    "link": "https://docs.google.com/forms/d/10CAzwsv3Lg9aiO9lYC71hR-xjV-xAQJClwL0WUYPK8g/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "me9joxp",
    "titolo": "Calendario dell'avvento della scomposizione",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Calendario dell'avvento della scomposizione",
    "link": "https://docs.google.com/presentation/d/14yICXcrgW7uwUbqndhHKZ1Hhi72tqCBbONxSw5pzneg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mdv70vd",
    "titolo": "AI 101",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "AI 101",
    "link": "https://docs.google.com/presentation/d/1bdO8mQzVNSONH6DvIZvyR3y1AtdE0JMd4iWRvqHmz_M/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1vi4702",
    "titolo": "Arduino 101",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Arduino 101",
    "link": "https://docs.google.com/presentation/d/1rLpN0M_ycaxewu-Rsg7KSm9gJL93vcNS9R-18ZY1i90/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1j0u32p",
    "titolo": "Python 301",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Python 301",
    "link": "https://docs.google.com/presentation/d/1V2svblMH-G4OUpEy3xo8PU6ueUznGAkSz5RAgyZfRDI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mtldet2",
    "titolo": "Python 201",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Python 201",
    "link": "https://docs.google.com/presentation/d/1I1bwPOXG3o5J3faB5myxfKuDH3kQfOPF1_SV0yQ48v0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mkw8zy1",
    "titolo": "AI 201",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "AI 201",
    "link": "https://docs.google.com/presentation/d/1mnRlCUWDRHai3CUONvfmsY8Nn5qw1iLw4inS7Adwu_E/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mz3eybt",
    "titolo": "Robotica 101",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Robotica 101",
    "link": "https://docs.google.com/presentation/d/1Hjr-tFg26H4PpTTUmcGr4n9_CspfPhjDMGyFKbtkGvA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2g36i1",
    "titolo": "Python 101",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Python 101",
    "link": "https://docs.google.com/presentation/d/1EEFkiz3RjzB2mdpZZyLczK-0Q3Ane7G0hPtEVgEFmvU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mr8u33e",
    "titolo": "Conway's Game of Life",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "Conway's Game of Life",
    "link": "https://docs.google.com/presentation/d/1ZA54UHqPx36bEMSgQ6uP-x4UGsIQzEn63Fs3dbNdP50/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m11r7kgn",
    "titolo": "C - Corso Base",
    "categoria": "Presentazioni",
    "materia": "STEM",
    "argomento": "C - Corso Base",
    "link": "https://docs.google.com/presentation/d/127XvU-idXcW0Zt8wBxv2AlBifngfQi5Q74PVUGisRow/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1hwg8fz",
    "titolo": "Coniche",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Coniche",
    "link": "https://docs.google.com/presentation/d/1_bPBBujeGKBWHuDbpp7o6IW1Yao5bAHa-D2UTdazFgw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1rfbglu",
    "titolo": "Esponenziali",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Esponenziali",
    "link": "https://docs.google.com/presentation/d/1YpbFIHDovcDdM69sibISQss34uwKBVawwvfqcIlnDC8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "myx8ybz",
    "titolo": "Lesson Rewind 3C - A.S. 2025/26",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Lesson Rewind 3C - A.S. 2025/26",
    "link": "https://docs.google.com/presentation/d/16gRQyq1R4ppppar4zvk-BC4fLXOJFHaFf3COsi6YXV8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1at9jgd",
    "titolo": "Rette nel piano cartesiano",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Rette nel piano cartesiano",
    "link": "https://docs.google.com/presentation/d/1jHWJOsC8yjMxyvxoJJmdRNl6sqo21x7mZP7v3F0n_Ts/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m4nz42d",
    "titolo": "Trasformazioni nel piano",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Trasformazioni nel piano",
    "link": "https://docs.google.com/presentation/d/1XF4WlKwhr8csk73zJvyYYCYFk7OK_MD_D-_V7tXa3ok/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mhoyey7",
    "titolo": "Successioni",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Successioni",
    "link": "https://docs.google.com/presentation/d/1AObnqNKGUoh4iy9EgDtDitT23K5Nf02STawGI5glP7M/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1rgcmta",
    "titolo": "Teoremi funzioni derivabili",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Teoremi funzioni derivabili",
    "link": "https://docs.google.com/presentation/d/1uriLinD6BjtomgB7blzCskjTxQh0K7rVo6vnwKnchBs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m12urldx",
    "titolo": "Logaritmi",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Logaritmi",
    "link": "https://docs.google.com/presentation/d/1rofnMuyRdlbuDbgNyP7SosuIzS9W4f62xIKVAaC-bBw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m12fn6qh",
    "titolo": "Punti di non derivabilità",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Punti di non derivabilità",
    "link": "https://docs.google.com/presentation/d/10YD5n1n4LZ3uLPcK0IA-oVMdKvWUkE958F-ZRpCO08U/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1x721eh",
    "titolo": "Storia della Matematica",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Storia della Matematica",
    "link": "https://docs.google.com/presentation/d/1ga3G8MfNMjBXvwYcunyQj9R_jfzqJKLF1-3v46jITXo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m120cga7",
    "titolo": "Interesse",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Interesse",
    "link": "https://docs.google.com/presentation/d/1lAAcSO0Dvnbl9CAlGUHuhvCYGgti9XGLQs6zAINvAws/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1m4z720",
    "titolo": "Rendite",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Rendite",
    "link": "https://docs.google.com/presentation/d/18yJIicWYq4Hx4jz_TWrHEKDLCfapE_KvjwclYE7725U/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mk8tpgd",
    "titolo": "Statistica",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Statistica",
    "link": "https://docs.google.com/presentation/d/1JOpf-9_H0zoK5S7_WiUudhbko6j4vTIfSFW4iMQ-XAc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m17y6bwl",
    "titolo": "Funzioni",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Funzioni",
    "link": "https://docs.google.com/presentation/d/1UWXe6Euhpr2n1jAnJCkFKCrbD0rnVNXsqUcOsNfDOo0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m152d8sm",
    "titolo": "Equazioni",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Equazioni",
    "link": "https://docs.google.com/presentation/d/13f5Fo0BtiUnwVs6ABq3qDNomaZ0Wu6S-NN6grVqruNM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "moekmwj",
    "titolo": "Distribuzioni",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Distribuzioni",
    "link": "https://docs.google.com/presentation/d/1-gZ6rcOTtU9pkFfyzr3g8A1XTypgNzeR7BSy1etAmlA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mcqn2wr",
    "titolo": "Prodotti notevoli",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Prodotti notevoli",
    "link": "https://docs.google.com/presentation/d/1wISHTIptKpa5UUvy007YtiESpQJlxqRkcaEpoqCCr5I/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1fj19a7",
    "titolo": "Tabelle e grafici",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Tabelle e grafici",
    "link": "https://docs.google.com/presentation/d/1LFNC6jOPhuTO1NlVxp97sAawI7mpARcjPpdQawQlyyU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "my4t7ig",
    "titolo": "Scomposizione",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Scomposizione",
    "link": "https://docs.google.com/presentation/d/1EOQl5MWVBA2uWs1WWV8oI3eM-aqckFtE01f0RfbyjEc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1jmgx6e",
    "titolo": "Percentuali e notazione scientifica",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Percentuali e notazione scientifica",
    "link": "https://docs.google.com/presentation/d/1NLL0DzXkfVGUrhGIZ9tmS9lJMyOdhloXQ0GmeTfw3Q8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1xgx0gr",
    "titolo": "Numeri",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Numeri",
    "link": "https://docs.google.com/presentation/d/1unYveZdxt0KqjbTM2Lb54xMIspcgUs_H7Qr8jTRR0oU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1toemkm",
    "titolo": "Disequazioni",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Disequazioni",
    "link": "https://docs.google.com/presentation/d/1rsbovgWP3EaAxwYKY9W-u_fDCYPte4MeKWXJqxrfU3k/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1pahmw",
    "titolo": "Sezione aurea",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Sezione aurea",
    "link": "https://docs.google.com/presentation/d/19bpBYs1WvK_tXxBx8osiDObyqMTGIP5z1g6NIgwgTrw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m18vvt8z",
    "titolo": "Equazioni goniometriche",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Equazioni goniometriche",
    "link": "https://docs.google.com/presentation/d/15ogaikoIV5w0zdkQwR8Fmak9y2pT2UjmDXYmYcdznFs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1w69bzn",
    "titolo": "Funzioni - Proprietà",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Funzioni - Proprietà",
    "link": "https://docs.google.com/presentation/d/1MI_GS1snFhQ7LsWMLENtWmSjNos8uUNow4trt66CYBU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1czhrtg",
    "titolo": "Probabilità",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Probabilità",
    "link": "https://docs.google.com/presentation/d/1A2pO1gBLaY5H5kof8VMK444Odi5R8IG6S4TGEGd3k0w/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1182ku2",
    "titolo": "Integrali",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Integrali",
    "link": "https://docs.google.com/presentation/d/12ynbSXPXi9K3JqA0Kco7Vx1mjNMLzZC-P5xkUVibcAw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1p6kuy0",
    "titolo": "Derivate",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Derivate",
    "link": "https://docs.google.com/presentation/d/1hOX-SgVS2yS1xn20Zx2jKlW1uoDq9nDjdOIfWgg0YtM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m3wr7xy",
    "titolo": "Continuità",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Continuità",
    "link": "https://docs.google.com/presentation/d/1WOmV0qQ5nqOlyPUG3hOfW-AU6Qa1mE3qOCQaFZsa1o4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1hlnnp2",
    "titolo": "Radicali",
    "categoria": "Presentazioni",
    "materia": "Matematica",
    "argomento": "Radicali",
    "link": "https://docs.google.com/presentation/d/1GUrVqISrTVotB1cMuxHguiL8R8_K8x2-O_X8XGQDvmk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m69vqqi",
    "titolo": "ECDL - IT Security",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - IT Security",
    "link": "https://docs.google.com/presentation/d/1YEFil_Pw6qoAPYMDHszUCxLCR4fc71kgD7SfpS-qM-0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mk9lkft",
    "titolo": "ECDL - Spreadsheets",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - Spreadsheets",
    "link": "https://docs.google.com/presentation/d/1FYBtDbjonGMDB3jyyLQI-SzMuzEdpUnoXsHLJz7ZCso/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1nlsnoa",
    "titolo": "ECDL - Computer essential",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - Computer essential",
    "link": "https://docs.google.com/presentation/d/1l36M8BF9xmFzuRoLOQVDIclAef6ZYyHxABRSl6jXgE0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mqpmlyy",
    "titolo": "ECDL - Presentation",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - Presentation",
    "link": "https://docs.google.com/presentation/d/1Z0u1y9bwPMleoqTIrblrKMY5tj6PVjR6SbPVOWQpHoY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1o4b36j",
    "titolo": "ECDL - Word Processing",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - Word Processing",
    "link": "https://docs.google.com/presentation/d/13a_skrkBLzmJlOj7irTA8ilzi8GAafyE7cN6Z8DPo7U/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1h0k9of",
    "titolo": "ECDL - Online collaboration",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - Online collaboration",
    "link": "https://docs.google.com/presentation/d/1zQyRreuFboh_XgS2MEyTFah-ekzq7Icocc3_ztrE-4U/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mr0lwjk",
    "titolo": "ECDL - ICDL Full standard",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "ECDL - ICDL Full standard",
    "link": "https://docs.google.com/presentation/d/193Q1uw9oUrvBnlD-Rz42GvLXbgg2e5IufqZbco6m7GU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m71ui9f",
    "titolo": "Infografiche",
    "categoria": "Presentazioni",
    "materia": "Informatica",
    "argomento": "Infografiche",
    "link": "https://docs.google.com/presentation/d/17ykKr1wQvYFDMsTzpKiwdllnUOzvi_rLhbcqvqQH2wM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1mgr10u",
    "titolo": "Fisica per principianti",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica per principianti",
    "link": "https://docs.google.com/presentation/d/1feDhtd0GxQZ73CdtK-e3F4jDazvBZ5pJ9uPUvle3rpg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mczjc10",
    "titolo": "Elettrizzazione",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1oolQ2jf1Akoft83Z8Vxn3NuVG7jFyipvwgedfU1j5sw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mevgn6z",
    "titolo": "La forza di Coulomb",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1TPyV-V0snYxyLXaSfi839OZlBBV-JtWHwQWhuXwmNyk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m18j20bo",
    "titolo": "Fenomeni di elettrostatica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1mqFQSU0LM4V-Fs6WbGKSHG-3JDgQdyYM_EkMyVG2ZF0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1g25df2",
    "titolo": "Corrente nei metalli",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1LV5nTEHE0Tz43gAiblGD4bj7fcXxk3HEf0MLZ1FEKRg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1uh5kd2",
    "titolo": "Campo",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1KWuSR0PZ_NqDs3MJL_7AYxzcPBUo-wNddomKhVuka9Q/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1d11o7",
    "titolo": "Potenziale elettrico",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1O9ZVIZYxp5R778O8HEnkFidreJN6o3N94f8upXtBkcw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1pel3y6",
    "titolo": "Circuiti",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1pnNhohHrkxFBzkBiEdsGSJamrKtHopwkOVyCTJXUzMM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mrzs1uj",
    "titolo": "Teorema di Gauss",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1tGUR5J-wJT9iD56UAewVDxxHk3M6bWtvnWCJxr5O7GA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mthhmks",
    "titolo": "Integrali in fisica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettrostatica",
    "link": "https://docs.google.com/presentation/d/1n8a2-IpmwGSW2Go7hYs47vVOn4hL_EFFoyjiWnvq4mg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1uinlcr",
    "titolo": "Relatività speciale",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Relatività",
    "link": "https://docs.google.com/presentation/d/15Pj-krfJ6CuCCdKSszm9CDd_AP2zT1eJRuopj_jPhC4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mr34tcw",
    "titolo": "Relatività generale",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Relatività",
    "link": "https://docs.google.com/presentation/d/1CTd5IblPelwgKRMKFGlewn9OMrHxg1QCoVLNzVNl-Nw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1p4m1pm",
    "titolo": "Equivalenze relativistiche",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Relatività",
    "link": "https://docs.google.com/presentation/d/1VB9kEeWDZ0VOiVJs0Ai8NOeMmF4iqqcEqZK_oUwO-k8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1xc88yx",
    "titolo": "Paradossi della relatività",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Relatività",
    "link": "https://docs.google.com/presentation/d/1KE9aWoMs1lDpu3GLudKZOfjbgFeStjQJ6_PIsS5d6jo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mjo4nsv",
    "titolo": "Spaziotempo di Minkowski",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Relatività",
    "link": "https://docs.google.com/presentation/d/1v-icAKvNhkixDNL0_ty-5P58DyBRlVrE3gu0gMkLnBg/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ej0j0b",
    "titolo": "Moto parabolico",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1pCNalhAuFBN3LFQzRGJ3Sgx8_8D21NfdXi3kwPDGsNs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mktoo8c",
    "titolo": "Moto circolare",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1q0L5WsUgyh1YquZ8Yd0183S6OOjvEldaz-x1Pc1nY1Q/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1kmg43e",
    "titolo": "Momento meccanico",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1Ft_s_Tx1nNTptkdK5ViT0S35PSFyMLfqrVtNK638XTk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1gzea0k",
    "titolo": "Equilibrio",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1Xj21-27Dv6PsAP6g0m5ZpLKMRNHJ11tV_dgDripr48Q/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "ml16erz",
    "titolo": "Caduta sul piano inclinato",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1hEx9cwmvl4af2R2IY6cB9DcavvjbuEN4FSXh5J21F5c/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mnn5zx5",
    "titolo": "Moto rettilineo uniforme",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1CJXHM5Ge6cvg7GVhdM4r2S763rzEUArTXyzEemYuq68/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mu6omiv",
    "titolo": "Cinematica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1ZTB2-I1JgqIJ00bcEkB4k7Wno7TM-vcg88cuxLLumJY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1fim3m1",
    "titolo": "Moto uniformemente accelerato",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1U3cM9MVF_Voh3N4MIOKLGgng7KLr7599F8NLAmKeAcw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mrx398d",
    "titolo": "Moto di caduta",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1OUfSuCShsL6AaNeLN1vx-hU-D9VOmsYrSBg6T1KUTls/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1tiemp9",
    "titolo": "Velocità istantanea",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/167U7B_wTJNCUWVAGnlf7B4b6MEtUyiO7JHNPX2EpKNY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mz1miey",
    "titolo": "Attrito",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica",
    "link": "https://docs.google.com/presentation/d/1FMhE-aWCrwoPL61KWx52xGmnHP14Bf-KGPqIPtaasJk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m116wayb",
    "titolo": "Leggi di conservazione",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica / Dinamica",
    "link": "https://docs.google.com/presentation/d/1mIb5XiUUnmpbJI-DcK_cuRsubvNuakTyW0bv8hMV4U0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ktgxr8",
    "titolo": "Gravitazione",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica / Dinamica",
    "link": "https://docs.google.com/presentation/d/1cVZVzYczYMoaUQJgj1VImJYqQ7d9EQPT-FuCQtZzDx8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1vh48my",
    "titolo": "Energia",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica / Dinamica",
    "link": "https://docs.google.com/presentation/d/17A75IinKWE9i0Mn5Qqnwia-mHLc-yj6bEkG8ilekuKo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mojhnxg",
    "titolo": "La Forza",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica / Dinamica",
    "link": "https://docs.google.com/presentation/d/1SslENSWeOBS3-jM48k_hjwl4AxYcFTuFdsfL344vkVs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1c9yhk",
    "titolo": "Principi della dinamica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Meccanica / Dinamica",
    "link": "https://docs.google.com/presentation/d/1YN1Xz9RE1z1-v-DbXmvc7-VBRSRwTv2X31s2VZ5Nd_w/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m5acd5w",
    "titolo": "Fluidostatica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fluidi",
    "link": "https://docs.google.com/presentation/d/1SEe_0qP_HnYe9nnZCeFMkQomECRW2LdtzIrYAh8uo1A/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1poskku",
    "titolo": "Fluidodinamica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fluidi",
    "link": "https://docs.google.com/presentation/d/1UqvqZ92Zjp2Rm1YQHbyx8rfExkcDAPm-HBlQ4h9bYoY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1g3bntc",
    "titolo": "Luce",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Onde",
    "link": "https://docs.google.com/presentation/d/1lMJlRoKIEZHq1W95ll1H-kVhEgVstV_LDnoQ7RQk3Bs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1ien1w8",
    "titolo": "Onde",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Onde",
    "link": "https://docs.google.com/presentation/d/1uHlYsrcXF_1u6uuKUonMBn6q-7O_JONAMQAeXrOQjqk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mffghnn",
    "titolo": "Interferenza",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Onde",
    "link": "https://docs.google.com/presentation/d/1ScFTUlXiyNQz-ed9FAYYftnU0nRARhAD4NpDU238bWI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m9h12f",
    "titolo": "Ottica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Onde",
    "link": "https://docs.google.com/presentation/d/1LnOeq6emg58cG8bxYKk6qz279txtr30IrpriHEaxcQQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "ml5drza",
    "titolo": "Fisica e poesia - 4°",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica e Poesia",
    "link": "https://docs.google.com/presentation/d/1sXMVuwKRXGFRFw2fKJW4oq-6XdA2A1nVrgO-Wvw0Zv4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1mep42y",
    "titolo": "Induzione magnetica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1FEOdjX-YxcTV8n9Jd5g8F-aGpUKA7K1szoKqKJR6wlk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mcnpsp",
    "titolo": "Verso le equazioni di Maxwell",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1rqo9fKHwCuIwE34YhxDyMfKRxNb1fWMZxDYSZNcFkPA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m13xkv0b",
    "titolo": "Tesla vs Edison",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1PecU0Hcthem0xbyYuhjotZG0jDzNKFwsSkFAGiy_FKk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1vhtf7k",
    "titolo": "Equazioni di Maxwell",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1eHAhcVegM2cgvwLqzs2Xynm58OXsm4t1VwFfylISShs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mkv3hcg",
    "titolo": "Forza di Lorentz",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1oYwLiyJ9ZcH1vcrs9iG3FfjOt4R2uMa1jJiyappGHNs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mj5p1pa",
    "titolo": "Fenomeni magnetici",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1hHfm8gX85COxyxjFCUaCKZVcpbu5I-NoGsX2rm1-WRI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mtoc58c",
    "titolo": "Magnetizzazione",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1arf1B2ErCDYWiUDpEGRy-tMNTo_xmLdQ9H0jVPvwamU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mkvsp72",
    "titolo": "Teorema di Ampere",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Elettromagnetismo",
    "link": "https://docs.google.com/presentation/d/1HI07DJx-l1VfMu6pghr5s3v82aVh1COR86k8w_i7MGc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mh7c0lq",
    "titolo": "Introduzione alla fisica quantistica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1iz6cu8S8RmWcyr3HKgg1GAC2dDtL3Rq64HoPI827Aww/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m14q3dov",
    "titolo": "Universo for kids",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1QPUNGsX9nnbphJUQmpvmVm5bM-F5hM6Lm7KA7C0sJe4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mz18ep4",
    "titolo": "Universo",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1T-sChpx2PbIKOjQy63TZVpKNxlUAowwM5fUGYHJC-CY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1l5cme",
    "titolo": "Big Bang e cosmogenesi",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1vNBXYEW7Vw9AMiVKqzRM0mFvrgfOr6Gakh-ciwPbHsY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2ws3rw",
    "titolo": "Corpo nero",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1kbjOyQMfVjIxzuY7ZAwbo4W0hH9DTCcuAJrV-dis0Q8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mzeh57d",
    "titolo": "GPS",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1fJKVRgE3DLSlVzXdckv11aaLBLYavR6NrtJ7WpCOAw8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1httlxq",
    "titolo": "Call for paper - Simulazione della ricerca di un pianeta extrasolare mediante l'uso di Arduino",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1suqNOACuQfPqAqpgjziudoc2mqW_0FCZC_4s4XOn5_I/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1fht5k6",
    "titolo": "Modelli atomici",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1wdiBXOcq6kIiVKEnnasM87rQ-_xqDFwVF9P3B0NQy2o/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m7bfkld",
    "titolo": "Fisica nucleare",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1n9UDcCFLw9uMVVBbw0czc6qa7qVECbfCirLAaBJE3iA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1xut29e",
    "titolo": "La crisi della Fisica classica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1O0XlBEtGuyBjlgHhKsZYEj_GCIWkV8A1NtkxQMoC7yE/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1iwfaf0",
    "titolo": "Numeri quantici",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1Ww0NwMTwy0t4pn4DJ-IR_rjac5skS02TWi7H8X-HLXI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1i4y3v8",
    "titolo": "Modello standard",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1CKwOfWlqzN_ZEZ4e5P1vMqCmnAKTBGeeUQDo42yBJak/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mkqha1w",
    "titolo": "Buco nero",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1tfP_AX1UyK_MJei1w2xnvXDm_N33IRwuNSTjCoKRZNo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "msdcsiq",
    "titolo": "Fisica Teorica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/13HiS9YSb-ZJN_2no0xNCSHo-t7gUiANLhophR9g0Yv4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1244s0y",
    "titolo": "Atomi",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Fisica moderna",
    "link": "https://docs.google.com/presentation/d/1ckI8iAG3gC0Arkf3xTROdmJZ6gbcea8roXlKdUyof4c/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mq3g2un",
    "titolo": "Cicli termodinamici",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1UdN69MaSAkG61Zsdf1F0sR7s-YCudRQ9YPMh3SRZBZw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mtp397a",
    "titolo": "Le leggi della termodinamica",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1YlrjUYCTFTSjVpskF0S4rJqoRvtzLwcS-BZUQ_69lSo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mitxtnz",
    "titolo": "Leggi dei gas",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1A5n-PsQXYaaoKylSq9AxzcUaMmODiLRLQ6V5kplgYkU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1p4tj9v",
    "titolo": "Termologia",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1jsjAOCfSV0f-M0hfM-0hsnEpjQ7KzqgzlCRZl8hYKIM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1u7usdt",
    "titolo": "Calore",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1Nys-Jfqfput-vPdBidS8udSdxn7RONri--m2_3j7tQE/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m133y97y",
    "titolo": "Passaggi di stato",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1Aj07krC7kT7IU_sqy5419y5oQvODZ4Mrqf0HKy--BTY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1wb6ejx",
    "titolo": "Calore for kids",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/10AwwoF0wKzc4G3c3MqEXrvwusI7O1WOhZxTcMlxxHGo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1z0nc52",
    "titolo": "Tensione superficiale for kids",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1yF0yfyLHvepDw2uM4XtfUxURXtJw4OmCFvN674p6sxU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mvrn4ne",
    "titolo": "Entropia",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Termodinamica",
    "link": "https://docs.google.com/presentation/d/1hrOaUvr_mOk8cn0VWEgQOgccFU0SNQ_BC4uBcJE7XzA/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2bme8m",
    "titolo": "Teoria degli errori",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1cyYhtRR3K9oA3miT0SgQz3JleZzwOVZtGT201LVOYwk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1uyh2k4",
    "titolo": "Calibro",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1cuulWuUFYPvMNOGepmxJaewBKCqHSNlN1WA2D9LaTP8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mrfxdou",
    "titolo": "Metodo scientifico",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1Q5V1Plf6hV2rZ4GZKThwPwqouCN8iuN2vcAgRaDb_KI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m14fzecf",
    "titolo": "Vettori",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1Krfa2w4__7eE15G4xQ-VQrjlnrSyWiIv9VoRpicbtJ8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mzus69p",
    "titolo": "La misura",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1R8qnJsIhL0hDviDRuywD6xyCMnP-0cvIjbL2ppCFXrk/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m8gs78u",
    "titolo": "Grandezze fisiche",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1hW13uZJLflMSSYaESRYcllpE40MfIbeQnp-8cIaIHNY/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1uq0kbo",
    "titolo": "Il disastro dell'Hindenburg",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1M_1obDnYJDfHrbfZyw_nOmyhOe-bgBaeIBnaInEF7uM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mm7w20h",
    "titolo": "Grafico cartesiano",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/14MmRko8l6ZSKb_Ymuq3jBqw4jcuzEq1uuWD6T-oDs9g/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "my16rhc",
    "titolo": "Pendolo",
    "categoria": "Presentazioni",
    "materia": "Fisica",
    "argomento": "Misura",
    "link": "https://docs.google.com/presentation/d/1innk7K_zBbN3Y1SHLF-gat4-pDML0-qJz2wggawfRI4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1skhgju",
    "titolo": "Latex 101",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Latex 101",
    "link": "https://docs.google.com/presentation/d/1vt6vntKPCrRNOwJRGsibLaUFLDoIiIIbo2AliJPiCNc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m11g37ay",
    "titolo": "Lesson Rewind 3A - A.S. 2025/26",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Lesson Rewind 3A - A.S. 2025/26",
    "link": "https://docs.google.com/presentation/d/11G-JrLgVAzFouRoIRnFIS4JvBphQ1J7kSqJHHdKWqV4/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mg0gbnp",
    "titolo": "Luna",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Luna",
    "link": "https://docs.google.com/presentation/d/1ia8vSuUXAQN2dYF36kkn5jGdIUEPWxWMq6sHadmJzsw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m2s3l50",
    "titolo": "Fisica e poesia",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Fisica e poesia",
    "link": "https://docs.google.com/presentation/d/1HqVxJKBjQGerPfq-ZsFDDRzyN7wa7jjHW6RhNbxNdAI/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mhwmkm1",
    "titolo": "Energia e sviluppo",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Energia e sviluppo",
    "link": "https://docs.google.com/presentation/d/1PxW4e4l57_yoPVA-o34DSQT2UDGb8ISHXG-7fyJPX9g/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m3lle4g",
    "titolo": "Donne",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Donne",
    "link": "https://docs.google.com/presentation/d/1Rk0hDytCPdzBLMTz_13_me11vzCXIXu15Ew9lAcDMbo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m14cn0u3",
    "titolo": "Stelle",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Stelle",
    "link": "https://docs.google.com/presentation/d/1fnj1k40Voad3YewFZD3ZrE3r2ikyovtUhj472boSyBQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m10974bk",
    "titolo": "Riflessioni",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Riflessioni",
    "link": "https://docs.google.com/presentation/d/1866KDPXj9xededksrEAv8mOhnzLfYSX5UGo2gKSMoDQ/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1vptcgu",
    "titolo": "Licei",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "Licei",
    "link": "https://docs.google.com/presentation/d/1mCEMbzMURqaIT-rzz2Re6G4DeEseDQQxA1WD7Cickf8/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mookkmy",
    "titolo": "I giganti della Fisica - Karl Schwarzschild",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/13hrz1gx11Lw_kA9d1jBDm5alc-MZkjJ46jTEPXRhaJ0/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1trzvfp",
    "titolo": "I giganti della Fisica - James Clerk Maxwell",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1g0PpPokEokST5YaP8wGwZqZN4H6UCEoIk-TLwLaLpmM/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mn2uej8",
    "titolo": "I giganti della Fisica - Charles Augustine de Coulomb (Eng)",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1f0BanjUNtFgLxXRJ0bnAkJwqrNdGJ79CVy0TV-d4hdw/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "mtojgu9",
    "titolo": "I giganti della Fisica - Donald Arthur Glaser",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1hlB92r8mxypA6Yk7zh7HZc6QQRRWzhqI_PpaJKWefkU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "meznuai",
    "titolo": "I giganti della Fisica - André Marie Ampère",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1W5r8JpkkJXnXmXR-6WknSPBPg3eG_MsUGrNpfBoBPLs/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m8fjmd2",
    "titolo": "volti della Fisica",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1pgv-siS-Qp3SuFpisH5XKkArBnyz2VfMyNzMAueF0dc/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m6qk8td",
    "titolo": "I giganti della Fisica - Tim Berners Lee",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1-ApLVC1duXs4AoW5lb9-_e1icQd4tZTzrOKyB0P-CKo/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "m1clh7j2",
    "titolo": "I giganti della Fisica - Isidor Isaac Rabi",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/18HP5nQMKE3_5zY8JZjPRjbttgMz8kOWMay84hj6bJHU/edit?usp=drivesdk&ouid=116994889461321777907"
  },
  {
    "id": "muba06d",
    "titolo": "I giganti della Fisica - Michael Faraday",
    "categoria": "Presentazioni",
    "materia": "",
    "argomento": "I giganti",
    "link": "https://docs.google.com/presentation/d/1M_0Exgu-8S_ZeBT-IEF03Tl4mZZZXmoD-pdfd_HEZIg/edit?usp=drivesdk&ouid=116994889461321777907"
  }
];
