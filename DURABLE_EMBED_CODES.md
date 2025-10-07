# Durable.co Embed Codes

## How to Embed LMS in Durable Pages

Once the app is deployed to Cloudflare Pages at `app.elevateforhumanity.org`, use these codes in your Durable pages.

---

## 1. Simple Link Button

Add this to any Durable page:

```html
<a href="https://app.elevateforhumanity.org/lms" 
   target="_blank"
   style="display: inline-block; padding: 16px 32px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px;">
  🎓 Access Learning Management System
</a>
```

---

## 2. Full-Width Iframe Embed

Embed the entire LMS directly in a Durable page:

```html
<div style="width: 100%; height: 100vh; margin: 0; padding: 0;">
  <iframe 
    src="https://app.elevateforhumanity.org/lms" 
    width="100%" 
    height="100%" 
    frameborder="0"
    style="border: none; display: block;"
    allow="fullscreen"
  ></iframe>
</div>
```

---

## 3. Card-Style Link

```html
<div style="max-width: 600px; margin: 40px auto; padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
  <h2 style="color: white; font-size: 28px; margin-bottom: 16px;">Learning Management System</h2>
  <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin-bottom: 24px;">
    Access your courses, track progress, and earn certifications.
  </p>
  <a href="https://app.elevateforhumanity.org/lms" 
     target="_blank"
     style="display: inline-block; padding: 14px 28px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600;">
    Launch LMS →
  </a>
</div>
```

---

## 4. Multiple Quick Links

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; padding: 40px 20px;">
  
  <!-- LMS Dashboard -->
  <a href="https://app.elevateforhumanity.org/lms/dashboard" 
     target="_blank"
     style="padding: 24px; background: #f3f4f6; border-radius: 12px; text-decoration: none; color: #1f2937; border: 2px solid #e5e7eb; transition: all 0.3s;">
    <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Dashboard</h3>
    <p style="font-size: 14px; color: #6b7280;">View your progress</p>
  </a>
  
  <!-- Courses -->
  <a href="https://app.elevateforhumanity.org/lms/courses" 
     target="_blank"
     style="padding: 24px; background: #f3f4f6; border-radius: 12px; text-decoration: none; color: #1f2937; border: 2px solid #e5e7eb; transition: all 0.3s;">
    <div style="font-size: 32px; margin-bottom: 12px;">📚</div>
    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Courses</h3>
    <p style="font-size: 14px; color: #6b7280;">Browse catalog</p>
  </a>
  
  <!-- Progress -->
  <a href="https://app.elevateforhumanity.org/lms/progress" 
     target="_blank"
     style="padding: 24px; background: #f3f4f6; border-radius: 12px; text-decoration: none; color: #1f2937; border: 2px solid #e5e7eb; transition: all 0.3s;">
    <div style="font-size: 32px; margin-bottom: 12px;">🎯</div>
    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Progress</h3>
    <p style="font-size: 14px; color: #6b7280;">Track achievements</p>
  </a>
  
</div>
```

---

## 5. Hero Section with CTA

```html
<div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 80px 20px; text-align: center; color: white;">
  <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 20px;">
    Start Your Learning Journey
  </h1>
  <p style="font-size: 20px; margin-bottom: 40px; opacity: 0.9;">
    Access world-class courses and earn industry-recognized certifications
  </p>
  <a href="https://app.elevateforhumanity.org/lms" 
     target="_blank"
     style="display: inline-block; padding: 18px 36px; background: white; color: #4f46e5; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
    Get Started Now →
  </a>
</div>
```

---

## 6. Popup/Modal Trigger

```html
<button onclick="openLMS()" 
        style="padding: 16px 32px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer;">
  Open LMS
</button>

<script>
function openLMS() {
  window.open('https://app.elevateforhumanity.org/lms', 'LMS', 'width=1200,height=800,scrollbars=yes,resizable=yes');
}
</script>
```

---

## How to Add to Durable

1. Go to your Durable page editor
2. Add a "Custom HTML" block
3. Paste any of the above codes
4. Save and publish

## Important Notes

- Replace `app.elevateforhumanity.org` with your actual Cloudflare Pages URL
- Test all links after deployment
- Iframes work best for seamless integration
- Direct links work better for mobile devices
- Consider using `target="_blank"` to open in new tab

## Preview Server (Testing)

For testing before Cloudflare deployment, use:
```
https://8080--0199bf65-f2f1-7175-b8bc-05eec2adf334.us-east-1-01.gitpod.dev/lms
```
