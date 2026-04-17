import React, { useEffect, useState } from 'react';
import { Modal, Button, Field, Input, IconButton, ColorPicker, Select } from '@grafana/ui';
import { COLORS, FONT } from 'styles/tokens';
import { ThreasholdsConfig, ThresholdsData } from 'types';
import { COMPARISON_OPTIONS } from '../../constants';

interface Props {
    value?: ThreasholdsConfig[];
    onSave: (value: ThreasholdsConfig[]) => void;
    onCancel: () => void;
}

export const ThresholdsFormModal: React.FC<Props> = ({
    value,
    onSave,
    onCancel,
}) => {
    const [thresholdsGroups, setThresholdsGroups] = useState<ThreasholdsConfig[]>([]);

    useEffect(() => {
        setThresholdsGroups(value ?? []);
    }, [value]);

    const addThresholdGroup = () => {
        const updated = [...thresholdsGroups];
        const newEmptyGroup: ThreasholdsConfig = {
            name: '',
            thresholds: [
                {
                    operator: '>',
                    value: 0,
                    color: COLORS.warning,
                }
            ]
        }
        updated.push(newEmptyGroup);
        setThresholdsGroups(updated);
    }

    const removeThresholdGroup = (groupIdx: number) => {
        setThresholdsGroups((prev) =>
            prev.filter((_, index) => index !== groupIdx)
        );
    };

    const handleChangeName = (groupIdx: number, newName: string) => {
        const updated = [...thresholdsGroups];
        updated[groupIdx].name = newName;
        setThresholdsGroups(updated);
    }

    const addThreshold = (groupIdx: number) => {
        const newThreshold: ThresholdsData = {
            operator: '>',
            value: 0,
            color: COLORS.warning,
        };

        setThresholdsGroups((prev) =>
            prev.map((group, index) =>
                index !== groupIdx
                    ? group
                    : {
                        ...group,
                        thresholds: [
                            ...group.thresholds,
                            newThreshold,
                        ],
                    }
            )
        );
    };

    const removeThreshold = (
        groupIdx: number,
        thresholdIdx: number
    ) => {
        setThresholdsGroups((prev) =>
            prev
                .map((group, index) => {
                    if (index !== groupIdx) return group;

                    const updatedThresholds =
                        group.thresholds.filter(
                            (_, tIndex) => tIndex !== thresholdIdx
                        );

                    return {
                        ...group,
                        thresholds: updatedThresholds,
                    };
                })
                .filter(
                    (group) => group.thresholds.length > 0
                )
        );
    };

    const handleChangeThreshold = <
        K extends keyof ThresholdsData
    >(
        groupIdx: number,
        thresholdIdx: number,
        field: K,
        value: ThresholdsData[K]
    ) => {
        setThresholdsGroups((prev) =>
            prev.map((group, gIndex) =>
                gIndex !== groupIdx
                    ? group
                    : {
                        ...group,
                        thresholds: group.thresholds.map(
                            (threshold, tIndex) =>
                                tIndex !== thresholdIdx
                                    ? threshold
                                    : {
                                        ...threshold,
                                        [field]: value,
                                    }
                        ),
                    }
            )
        );
    };

    const validateGroups = (groups: ThreasholdsConfig[]) => {
        const names = groups.map((g) => g.name.trim());

        const hasEmptyName = names.some((name) => name === '');
        if (hasEmptyName) {
            return 'Todos os grupos precisam ter um nome.';
        }

        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
            return 'Não pode haver grupos com o mesmo nome.';
        }

        return null;
    };

    const handleSave = () => {
        const error = validateGroups(thresholdsGroups);
        if (error) {
            alert(error); // ou setError(error)
            return;
        }
        onSave(thresholdsGroups);
    };

    return (
        <Modal title={'Thresholds'} isOpen={true} onDismiss={onCancel}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {(thresholdsGroups ?? []).map((group, groupIdx) => (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 }}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    cursor: 'pointer',
                                    fontSize: FONT.label,
                                    fontWeight: 600,
                                    color: COLORS.text,
                                }}
                            >Group {groupIdx + 1}</label>
                            <IconButton
                                name="plus-circle"
                                variant="secondary"
                                onClick={() => addThreshold(groupIdx)}
                                tooltip="Add" />
                            <IconButton
                                tooltip="Remove"
                                name="trash-alt"
                                variant="destructive"
                                onClick={() => removeThresholdGroup(groupIdx)}
                            />
                        </div>

                        <Field label="Group name">
                            <Input
                                type="text"
                                value={group.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleChangeName(groupIdx, e.target.value)
                                }
                            />
                        </Field>

                        {(group.thresholds ?? []).map((threshold, threasholdsIdx) => (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 20px', gap: 8 }}>
                                <Field label="Operator">
                                    <Select
                                        options={COMPARISON_OPTIONS}
                                        value={threshold.operator}
                                        onChange={(option) =>
                                            handleChangeThreshold(
                                                groupIdx,
                                                threasholdsIdx,
                                                'operator',
                                                option.value as string
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Value">
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={threshold.value}
                                        onChange={(e) =>
                                            handleChangeThreshold(
                                                groupIdx,
                                                threasholdsIdx,
                                                'value',
                                                Number(e.currentTarget.value)
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Color">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <ColorPicker
                                            color={threshold.color}
                                            onChange={(color) =>
                                                handleChangeThreshold(
                                                    groupIdx,
                                                    threasholdsIdx,
                                                    'color',
                                                    color
                                                )
                                            }
                                        />
                                        <span style={{ fontSize: FONT.body, color: COLORS.textMuted }}>{threshold.color}</span>
                                    </div>
                                </Field>
                                <IconButton
                                    tooltip="Remove"
                                    name="trash-alt"
                                    variant="destructive"
                                    onClick={() => removeThreshold(groupIdx, threasholdsIdx)}
                                />
                            </div>
                        ))}
                    </>
                ))}

                <Button variant="secondary" icon="plus" onClick={addThresholdGroup} fullWidth style={{ width: '100%', marginTop: 20 }}>
                    Add Threshold Group
                </Button>

                <Modal.ButtonRow>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </Modal.ButtonRow>
            </div>
        </Modal>
    );
};