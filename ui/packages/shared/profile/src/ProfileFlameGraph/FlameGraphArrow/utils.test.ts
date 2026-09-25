// Copyright 2022 The Parca Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type {Table} from '@uwdata/flechette';
import {describe, expect, it} from 'vitest';

import {nodeLabel} from './utils';

// Minimal stand-in for a flechette Table: nodeLabel only ever calls
// `table.getChild(field)?.get(row)`.
const fakeTable = (row: Record<string, unknown>): Table =>
  ({
    getChild: (field: string) => (field in row ? {get: () => row[field]} : undefined),
  }) as unknown as Table;

describe('nodeLabel', () => {
  it('renders <unknown> when both function name and address are empty/zero', () => {
    const table = fakeTable({
      labels_only: false,
      depth: 2,
      function_name: '',
      mapping_file: '',
      location_address: 0n,
    });
    expect(nodeLabel(table, 0, false)).toBe('<unknown>');
  });

  it('renders the hex address when function name is missing but address is non-zero', () => {
    const table = fakeTable({
      labels_only: false,
      depth: 2,
      function_name: '',
      mapping_file: '',
      location_address: 4096n,
    });
    expect(nodeLabel(table, 0, false)).toBe('0x1000');
  });

  it('treats a zero address like a missing one when the binary name is shown', () => {
    const base = {
      labels_only: false,
      depth: 2,
      function_name: '',
      mapping_file: '/usr/lib/libc.so.6',
    };

    expect(nodeLabel(fakeTable({...base, location_address: 0n}), 0, true)).toBe('[libc.so.6]');
    expect(nodeLabel(fakeTable(base), 0, true)).toBe('[libc.so.6]');
  });

  it('prefers the function name when present', () => {
    const table = fakeTable({
      labels_only: false,
      depth: 2,
      function_name: 'main',
      mapping_file: '',
      location_address: 4096n,
    });
    expect(nodeLabel(table, 0, false)).toBe('main');
  });
});
