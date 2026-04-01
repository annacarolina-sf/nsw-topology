import React, { useState } from 'react';
import { Button, Field, Input, Modal } from "@grafana/ui";
import { config } from '@grafana/runtime';
import { ALLOWED_USERS } from '../../constants';

interface Props {
    sourceName: string;
    targetName: string;
    onCancel: () => void;
    onCreated: (success: boolean) => void;
}

// MODIF: Componente criado para para permitir a criação de tickets diretamente no painel do grafana
export const CreateTicketModal: React.FC<Props> = ({ sourceName, targetName, onCancel, onCreated }) => {
    const currentFormattedDate = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).replace(",", " -");
    const [subject, setSubject] = useState(`FALHA NO TRECHO: ${sourceName} ↔ ${targetName} (${currentFormattedDate})`);
    const [message, setMessage] = useState(`FALHA NO TRECHO: ${sourceName} ↔ ${targetName} (${currentFormattedDate})`);
    const [loading, setLoading] = useState(false);

    const isUserAllowed = () => {
        const user = config.bootData.user;
        console.log('Verificando se o usuário tem permissão para criar ticket')
        console.log(user.email in ALLOWED_USERS || user.login in ALLOWED_USERS)
        return user.email in ALLOWED_USERS || user.login in ALLOWED_USERS
    }

    const createTicket = async () => {
        console.log('Criando ticket...')
        if (loading) return;
        setLoading(true);
        if (!isUserAllowed()) return;
        const apiBaseUrl = process.env.REACT_APP_OSTICKET_BASE_URL;
        const apiKey = process.env.REACT_APP_OSTICKET_API_KEY;
        console.log('URL: ', apiBaseUrl)
        console.log('KEY: ', apiKey)
        if (!apiBaseUrl || !apiKey) {
            console.error("Variáveis de ambiente não definidas");
            onCreated(false);
            return;
        }
        try {
            const response = await fetch(
                `${apiBaseUrl!}/api/tickets.json`,
                {
                    method: "POST",
                    headers: {
                        "X-API-Key": apiKey!,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        alert: true,
                        autorespond: true,
                        source: "API",
                        assignId: "t1",
                        priority: 3,
                        topicId: 25,
                        name: "NOC",
                        email: "noc@grupodigitalnet.com.br",
                        subject: subject,
                        message: `data:text/html,${message}.`,
                    }),
                }
            );
            const responseData = await response.json();
            console.log('Ticket criado: ', responseData)
            onCreated(true);
        } catch (error) {
            console.error("Erro ao criar ticket:", error);
            onCreated(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal title="Create Ticket" isOpen={true} onDismiss={onCancel}>
            <Field label="Subject">
                <Input value={subject} onChange={(e) => setSubject(e.currentTarget.value)} />
            </Field>
            <Field label="Message">
                <Input value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
            </Field>

            <Modal.ButtonRow>
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={createTicket} disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </Modal.ButtonRow>
        </Modal>
    )
}