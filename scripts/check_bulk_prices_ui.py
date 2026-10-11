"""Check the built Fleet selection and bulk daily-price popup with mocked API data."""
import os
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

DIST = Path(__file__).resolve().parents[1] / 'dist'
vehicles = [dict(id=i, plate_number=f'KL01PRICE{i}', category='Swift', daily_price=price, is_active=True)
            for i, price in enumerate(['1000.25', '2000.50', '3000.00'], start=1)]
submissions = []


def serve_site(route):
    path = urlparse(route.request.url).path
    file = DIST / (path.lstrip('/') if path.startswith('/assets/') else 'index.html')
    route.fulfill(body=file.read_bytes(), content_type={'.js': 'text/javascript', '.css': 'text/css'}.get(file.suffix, 'text/html'))


def serve_api(route):
    if '/bulk-daily-price/' in route.request.url:
        payload = route.request.post_data_json
        submissions.append(payload)
        selected = {row['id'] for row in payload['vehicles']}
        updated = []
        for vehicle in vehicles:
            if vehicle['id'] in selected:
                amount = Decimal(payload['amount'])
                current = Decimal(vehicle['daily_price'])
                vehicle['daily_price'] = str(amount if payload['operation'] == 'set' else current + amount if payload['operation'] == 'increase' else current - amount)
                updated.append(vehicle.copy())
        return route.fulfill(json={'updated': len(updated), 'vehicles': updated})
    route.fulfill(json=vehicles if '/vehicles/' in route.request.url else [])


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'))
    page = browser.new_page(viewport=dict(width=1440, height=1000))
    page.set_default_timeout(10000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script("localStorage.setItem('zudo_user', JSON.stringify({email:'pricing@example.com', name:'Pricing', role:'admin', token:'test'}))")
    page.route('https://zudo.test/**', serve_site)
    page.route('https://api.zudocars.com/**', serve_api)
    page.goto('https://zudo.test/dashboard')
    page.get_by_role('button', name='Fleet', exact=True).click()
    expect(page.get_by_role('button', name='Update daily prices', exact=True)).to_be_disabled()
    page.get_by_role('checkbox', name='Select KL01PRICE1').check()
    page.get_by_role('checkbox', name='Select KL01PRICE2').check()
    page.get_by_role('button', name='Update daily prices', exact=True).click()
    dialog = page.get_by_role('dialog')
    expect(dialog).to_be_visible()
    expect(dialog.get_by_role('button', name='Apply to 2 vehicles')).to_be_enabled()
    expect(dialog.get_by_role('cell', name='₹1,100.25', exact=True)).to_be_visible()
    assert not submissions
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    assert not submissions
    page.get_by_role('button', name='Update daily prices', exact=True).click()
    page.get_by_role('button', name='Apply to 2 vehicles').click()
    expect(dialog).not_to_be_visible()
    assert len(submissions) == 1
    assert {row['id'] for row in submissions[0]['vehicles']} == {1, 2}
    assert vehicles[0]['daily_price'] == '1100.25'
    assert vehicles[2]['daily_price'] == '3000.00'
    page.get_by_role('button', name='Select all vehicles', exact=True).click()
    page.get_by_role('button', name='Update daily prices', exact=True).click()
    dialog.locator('#bulk-price-operation').select_option('decrease')
    dialog.get_by_label('Amount (₹)', exact=True).fill('4000')
    expect(dialog.get_by_role('button', name='Apply to 3 vehicles')).to_be_disabled()
    dialog.locator('#bulk-price-operation').select_option('set')
    dialog.get_by_label('Amount (₹)', exact=True).fill('1500.75')
    page.set_viewport_size(dict(width=390, height=844))
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    dialog.get_by_role('button', name='Apply to 3 vehicles').click()
    expect(dialog).not_to_be_visible()
    assert len(submissions) == 2
    assert len(submissions[1]['vehicles']) == 3
    assert all(vehicle['daily_price'] == '1500.75' for vehicle in vehicles)
    assert not errors, errors
    browser.close()

print('Bulk daily-price UI checks passed: multiple selection, select all, preview, cancel, validation, save, mobile layout.')
