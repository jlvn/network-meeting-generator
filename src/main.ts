import './styles.css'
import {PDFDocument} from 'pdf-lib'

const generateButton = document.getElementById('generateButton') as HTMLButtonElement

const nameElement = document.getElementById('name') as HTMLInputElement
const meetingDateElement = document.getElementById('meetingDate') as HTMLInputElement
const birthDateElement = document.getElementById('birthDate') as HTMLInputElement
const contactPersonNameElement = document.getElementById('contactPersonName') as HTMLInputElement
const contactPersonCompanyElement = document.getElementById('contactPersonCompany') as HTMLInputElement
const contactPersonSectorElement = document.getElementById('contactPersonSector') as HTMLInputElement
const meetingObjectiveElement = document.getElementById('meetingObjective') as HTMLInputElement
const meetingObjectiveReachedExplanationElement = document.getElementById('meetingObjectiveReachedExplanation') as HTMLInputElement
const extraRemarkElement = document.getElementById('extraRemark') as HTMLInputElement

const STORAGE_PREFIX = 'networkMeetingFiller:'

const inputsToPersist: HTMLInputElement[] = [
    nameElement,
    meetingDateElement,
    birthDateElement,
    contactPersonNameElement,
    contactPersonCompanyElement,
    contactPersonSectorElement,
    meetingObjectiveElement,
    meetingObjectiveReachedExplanationElement,
    extraRemarkElement
]

function getStorageKey(elementId: string) {
    return `${STORAGE_PREFIX}${elementId}`
}

function loadPersistedFormValues() {
    inputsToPersist.forEach((inputElement) => {
        const persistedValue = localStorage.getItem(getStorageKey(inputElement.id))
        if (persistedValue !== null) {
            inputElement.value = persistedValue
        }
    })

    const persistedRadioValue = localStorage.getItem(getStorageKey('meetingObjectiveReachedChoice'))
    if (persistedRadioValue) {
        const matchingRadio = document.querySelector(`input[name="meetingObjectiveReachedChoice"][value="${persistedRadioValue}"]`) as HTMLInputElement | null
        if (matchingRadio) {
            matchingRadio.checked = true
        }
    }
}

function setupFormPersistence() {
    inputsToPersist.forEach((inputElement) => {
        inputElement.addEventListener('change', () => {
            localStorage.setItem(getStorageKey(inputElement.id), inputElement.value)
        })
    })

    const meetingObjectiveReachedRadioButtons = document.querySelectorAll('input[name="meetingObjectiveReachedChoice"]') as NodeListOf<HTMLInputElement>
    meetingObjectiveReachedRadioButtons.forEach((radioButton) => {
        radioButton.addEventListener('change', () => {
            if (radioButton.checked) {
                localStorage.setItem(getStorageKey('meetingObjectiveReachedChoice'), radioButton.value)
            }
        })
    })
}

export async function fillAndDownloadNetworkMeetingPdf(templateFileName: string) {

    const existingPdfBytes = await fetch(templateFileName).then(res =>
        res.arrayBuffer()
    )

    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    const form = pdfDoc.getForm()

    const name = nameElement.value
    const networkingMeetingDate = meetingDateElement.value
    const birthDate = birthDateElement.value
    const contactPersonName = contactPersonNameElement.value
    const contactPersonCompany = contactPersonCompanyElement.value
    const contactPersonSector = contactPersonSectorElement.value
    const meetingObjective = meetingObjectiveElement.value
    const meetingObjectiveReachedExplanation = meetingObjectiveReachedExplanationElement.value
    const extraRemark = extraRemarkElement.value
    const meetingObjectiveReached = (document.querySelector('input[name="meetingObjectiveReachedChoice"]:checked') as HTMLInputElement)?.value || 'Keuze1'

    form.getTextField('Voorletters en naam').setText(name)
    form.getTextField('Datum netwerkgesprek').setText(networkingMeetingDate)
    form.getTextField('Geboortedatum').setText(birthDate)
    form.getTextField('Nummer gesprek').setText(contactPersonName)
    form.getTextField('Bedrijf contactpersoon').setText(contactPersonCompany)
    form.getTextField('Secori contactpersoon').setText(contactPersonSector)
    form.getTextField('Doel van het gesprek').setText(meetingObjective)
    form.getTextField('Waarom doel wel niet behaald').setText(meetingObjectiveReachedExplanation)
    form.getRadioGroup('Keuzerondje 2').select(meetingObjectiveReached)
    form.getTextField('Aanvullende opmerkingen').setText(extraRemark)

    const pdfBytes = new Uint8Array(await pdfDoc.save())

    const blob = new Blob([pdfBytes], {
        type: 'application/pdf'
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = url
    a.download = `netwerk_gesprek_${contactPersonCompany.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    a.click()

    URL.revokeObjectURL(url)
}

generateButton.onclick = () => fillAndDownloadNetworkMeetingPdf('/data/template.pdf')
setupFormPersistence()
loadPersistedFormValues()
