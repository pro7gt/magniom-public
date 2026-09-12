import React from 'react';

export interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
  subMessage?: string;
  className?: string;
}

export function TableEmptyRow({
  colSpan,
  message = 'No records located in this view.',
  subMessage,
  className = '',
}: TableEmptyRowProps) {
  return (
    <tr className={`table-empty-row ${className}`.trim()}>
      <td colSpan={colSpan} className="table-empty-cell">
        <p className="table-empty-message">{message}</p>
        {subMessage && <p className="table-empty-submessage">{subMessage}</p>}
      </td>
    </tr>
  );
}
