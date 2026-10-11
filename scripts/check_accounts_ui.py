"""Smoke test the built Accounts UI with mocked API responses.

Run with the backend virtualenv's Python after `npm run build`.
Set PLAYWRIGHT_CHROMIUM_EXECUTABLE when using a separately installed browser.
"""
import os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

DIST = Path(__file__).resolve().parents[1] / 'dist'
summary = dict(revenue='1000', received='600', outstanding='400', expenses='50', net_balance='950', customer_credit='0',
               vehicles=[dict(id=1, plate_number='KL01FIN')],
               bookings=[dict(reference='ZUDO-TEST', customer='Customer', vehicle='KL01FIN', status='completed',
                              billed='1000', received='600', outstanding='400', credit='0')],
               payments=[], expense_entries=[], maintenance_entries=[])
submitted = []


def serve_site(route):
    path = urlparse(route.request.url).path
    file = DIST / (path.lstrip('/') if path.startswith('/assets/') else 'index.html')
    route.fulfill(body=file.read_bytes(), content_type={'.js': 'text/javascript', '.css': 'text/css'}.get(file.suffix, 'text/html'))


def serve_api(route):
    url = route.request.url
    if '/accounts/summary/' in url:
        return route.fulfill(json=summary)
    if '/accounts/' in url and route.request.method == 'POST':
        payload = route.request.post_data_json
        if '/void/' in url:
            summary['payments'][0].update(voided_at='2026-10-11T12:00:00Z', void_reason=payload['reason'])
        else:
            submitted.append(payload)
            key = 'payments' if '/payments/' in url else 'expense_entries'
            summary[key].append(dict(id=1, **payload, voided_at=None, created_at='2026-10-11T12:00:00Z', created_by_name='Finance'))
        return route.fulfill(status=201, json=dict(id=1))
    route.fulfill(json=[])


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'))
    page = browser.new_page(viewport=dict(width=1440, height=1000))
    page.set_default_timeout(10000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script("localStorage.setItem('zudo_user', JSON.stringify({email:'finance@example.com', name:'Finance', role:'admin', token:'test'}))")
    page.route('https://zudo.test/**', serve_site)
    page.route('https://api.zudocars.com/**', serve_api)
    page.goto('https://zudo.test/dashboard')
    page.get_by_role('button', name='Accounts', exact=True).click()
    expect(page.get_by_role('heading', name='Booking balances')).to_be_visible()
    page.locator('form select').nth(0).select_option('ZUDO-TEST')
    page.get_by_label('Amount (INR)').fill('100.25')
    page.get_by_role('button', name='Record transaction').click()
    expect(page.get_by_text('Transaction recorded.', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Record transaction')).to_be_enabled()
    assert submitted[0]['amount'] == '100.25'
    page.get_by_role('button', name='Void', exact=True).click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.get_by_label('Reason', exact=True).fill('Incorrect receipt')
    page.get_by_role('button', name='Void entry', exact=True).click()
    expect(page.get_by_text('Voided: Incorrect receipt')).to_be_visible()
    page.get_by_role('button', name='Expense', exact=True).click()
    page.get_by_label('Description', exact=True).fill('Fuel invoice')
    page.get_by_label('Amount (INR)').fill('50.15')
    page.locator('form select').nth(1).select_option('1')
    page.get_by_role('button', name='Record transaction').click()
    expect(page.get_by_role('cell', name='Fuel invoice KL01FIN', exact=True)).to_be_visible()
    assert submitted[1]['vehicle'] == 1
    page.set_viewport_size(dict(width=390, height=844))
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    assert not errors, errors
    browser.close()

print('Accounts browser checks passed: payment, void popup, vehicle expense, mobile layout.')
